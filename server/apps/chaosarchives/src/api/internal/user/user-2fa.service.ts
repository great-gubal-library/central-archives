import { AuthService } from "@app/auth/auth.service";
import { UserInfo } from "@app/auth/model/user-info";
import { User } from "@app/entity";
import { checkPassword } from "@app/security";
import SharedConstants from "@app/shared/SharedConstants";
import { User2FAConfirmRequestDto } from "@app/shared/dto/user/2fa/user-2fa-confirm-request.dto";
import { User2FAConfirmResponseDto } from "@app/shared/dto/user/2fa/user-2fa-confirm-response.dto";
import { User2FARemoveRequestDto } from "@app/shared/dto/user/2fa/user-2fa-remove-request.dto";
import { User2FAStatusDto } from "@app/shared/dto/user/2fa/user-2fa-status.dto";
import { SiteRegion } from "@app/shared/enums/region.enum";
import { User2FAState } from "@app/shared/enums/user-2fa-state.dto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class User2FAService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User) private userRepo: Repository<User>,
    private authService: AuthService,
  ) {}

  async get2FAStatus(userInfo: UserInfo, region: SiteRegion): Promise<User2FAStatusDto> {
    return this.getEntity2FAStatus(await this.userRepo.findOneByOrFail({ id: userInfo.id }), region);
  }

  async request2FA(userInfo: UserInfo, region: SiteRegion): Promise<User2FAStatusDto> {
    return this.dataSource.transaction(async em => {
      const userRepo = em.getRepository(User);
      const user = await userRepo.findOneByOrFail({ id: userInfo.id });

      if (!user.totpSecret) {
        user.totpSecret = this.authService.generate2FASecret();
        await userRepo.save(user);
      }

      return this.getEntity2FAStatus(user, region);
    });
  }

  async cancel2FA(userInfo: UserInfo): Promise<User2FAStatusDto> {
    return this.dataSource.transaction(async em => {
      const userRepo = em.getRepository(User);
      const user = await userRepo.findOneByOrFail({ id: userInfo.id });

      if (user.use2FA) {
        throw new BadRequestException('2FA is already enabled and cannot be canceled. Remove it instead.');
      }

      if (user.totpSecret) {
        user.totpSecret = null;
        user.backupCode = null;
        await userRepo.save(user);
      }

      return this.getEntity2FAStatus(user);
    });
  }

  async confirm2FA(
    request: User2FAConfirmRequestDto,
    userInfo: UserInfo,
  ): Promise<User2FAConfirmResponseDto> {
    return this.dataSource.transaction(async em => {
      const userRepo = em.getRepository(User);
      const user = await userRepo.findOneByOrFail({ id: userInfo.id });

      if (user.use2FA) {
        throw new BadRequestException('2FA is already enabled');
      }

      if (!user.totpSecret) {
        throw new BadRequestException('2FA was not requested');
      }

      await this.checkPasswordOrFail(request.currentPassword, user.passwordHash);

      if (!this.authService.checkOtp(request.otp, user.totpSecret)) {
        throw new BadRequestException('Invalid one-time password');
      }

      user.use2FA = true;
      user.backupCode = this.authService.generate2FABackupCode();
      await userRepo.save(user);

      return {
        backupCode: this.backupCodeToDisplayForm(user.backupCode)
      };
    });
  }

  async regenerate2FABackupCode(request: User2FARemoveRequestDto, userInfo: UserInfo): Promise<User2FAConfirmResponseDto> {
    return this.dataSource.transaction(async em => {
      const userRepo = em.getRepository(User);
      const user = await userRepo.findOneByOrFail({ id: userInfo.id });

      if (!user.use2FA) {
        throw new BadRequestException('2FA is disabled');
      }

      await this.checkPasswordOrFail(request.currentPassword, user.passwordHash);

      user.backupCode = this.authService.generate2FABackupCode();
      await userRepo.save(user);

      return {
        backupCode: this.backupCodeToDisplayForm(user.backupCode)
      };
    });
  }

  async remove2FA(request: User2FARemoveRequestDto, userInfo: UserInfo): Promise<User2FAStatusDto> {
    return this.dataSource.transaction(async em => {
      const userRepo = em.getRepository(User);
      const user = await userRepo.findOneByOrFail({ id: userInfo.id });

      await this.checkPasswordOrFail(request.currentPassword, user.passwordHash);

      if (!user.use2FA && !user.totpSecret) {
        // No-op if 2FA is already disabled
        return this.getEntity2FAStatus(user);
      }

      user.use2FA = false;
      user.totpSecret = null;
      user.backupCode = null;
      await userRepo.save(user);

      return this.getEntity2FAStatus(user);
    });
  }

  private async checkPasswordOrFail(password: string, storedHash: string): Promise<void> {
    if (!(await checkPassword(password, storedHash))) {
      throw new BadRequestException('Invalid password');
    }
  }

  private backupCodeToDisplayForm(backupCode: string): string {
    return `${backupCode.substring(0, 4)}-${backupCode.substring(4, 8)}-${backupCode.substring(8, 12)}-${backupCode.substring(12, 16)}`;
  }

  private async getEntity2FAStatus(user: User, region = SiteRegion.GLOBAL): Promise<User2FAStatusDto> {
    let state: User2FAState;
    let qrDataUrl: string | null = null;

    if (user.use2FA) {
      state = User2FAState.ENABLED;
    } else if (user.totpSecret) {
      state = User2FAState.REQUESTED;

      const regionConfig = SharedConstants.regions[region];
      qrDataUrl = await this.authService.getQRCodeDataUrl(user.email, user.totpSecret, regionConfig.name);
    } else {
      state = User2FAState.DISABLED;
    }

    return {
      state,
      qrDataUrl,
    }
  }
}
