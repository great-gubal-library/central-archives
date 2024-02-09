import { AuthService } from "@app/auth/auth.service";
import { UserInfo } from "@app/auth/model/user-info";
import { User } from "@app/entity";
import { User2FAConfirmRequestDto } from "@app/shared/dto/user/2fa/user-2fa-confirm-request.dto";
import { User2FAConfirmResponseDto } from "@app/shared/dto/user/2fa/user-2fa-confirm-response.dto";
import { User2FARemoveRequestDto } from "@app/shared/dto/user/2fa/user-2fa-remove-request.dto";
import { User2FAStatusDto } from "@app/shared/dto/user/2fa/user-2fa-status.dto";
import { User2FAState } from "@app/shared/enums/user-2fa-state.dto";
import { BadRequestException, Injectable, NotImplementedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class User2FAService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User) private userRepo: Repository<User>,
    private authService: AuthService,
  ) {}

  async get2FAStatus(userInfo: UserInfo): Promise<User2FAStatusDto> {
    return this.getEntity2FAStatus(await this.userRepo.findOneByOrFail({ id: userInfo.id }));
  }

  async request2FA(userInfo: UserInfo): Promise<User2FAStatusDto> {
    return this.dataSource.transaction(async em => {
      const userRepo = em.getRepository(User);
      const user = await userRepo.findOneByOrFail({ id: userInfo.id });

      if (!user.totpSecret) {
        user.totpSecret = this.authService.generate2FASecret();
        await userRepo.save(user);
      }

      return this.getEntity2FAStatus(user);
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
    throw new NotImplementedException();
  }

  async regenerate2FABackupCode(userInfo: UserInfo): Promise<User2FAConfirmResponseDto> {
    throw new NotImplementedException();
  }

  async remove2FA(request: User2FARemoveRequestDto, userInfo: UserInfo): Promise<User2FAStatusDto> {
    throw new NotImplementedException();
  }

  private async getEntity2FAStatus(user: User): Promise<User2FAStatusDto> {
    let state: User2FAState;
    let qrDataUrl: string | null = null;

    if (user.use2FA) {
      state = User2FAState.ENABLED;
    } else if (user.totpSecret) {
      state = User2FAState.REQUESTED;
      qrDataUrl = await this.authService.getQRCodeDataUrl(user.email, user.totpSecret);
    } else {
      state = User2FAState.DISABLED;
    }

    return {
      state,
      qrDataUrl,
    }
  }
}
