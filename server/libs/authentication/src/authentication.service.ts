import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './impl/two-factor-authentication.service';
import { LoginCredentials } from './model/login-credentials';
import { checkPassword } from '@app/security';
import SharedConstants from '@app/shared/SharedConstants';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@app/entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    private twoFactorAuthenticationService: TwoFactorAuthenticationService,
  ) {}

  async authenticateUser(credentials: LoginCredentials): Promise<number> {
    const user = await this.userRepo.findOneBy({ email: credentials.email });
    let useUpBackupCode = false;

    if (!user || !(await checkPassword(credentials.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.use2FA) {
      if (!credentials.otp) {
        throw new BadRequestException(SharedConstants.errorCodes.OTP_REQUIRED);
      }

      const backupCode = credentials.otp.toUpperCase().replace(/[- ]/g, '');

      if (this.twoFactorAuthenticationService.isBackupCode(backupCode)) {
        if (user.backupCode === backupCode) {
          useUpBackupCode = true;
        } else {
          throw new UnauthorizedException('Invalid 2FA backup code');
        }
      } else {
        // regular OTP code
        if (!this.twoFactorAuthenticationService.checkOtp(credentials.otp, user.totpSecret!)) {
          throw new UnauthorizedException('Invalid one-time password');
        }
      }
    }

    if (useUpBackupCode) {
      await this.dataSource.transaction(async em => {
        await em.getRepository(User).update({ id: user.id }, { backupCode: null });
      });
    }

    return user.id;
  }

  async getQRCodeDataUrl(username: string, secret: string, issuer: string): Promise<string> {
    return this.twoFactorAuthenticationService.getQRCodeDataUrl(username, secret, issuer);
  }

  generate2FASecret(): string {
    return this.twoFactorAuthenticationService.generateSecret();
  }

  generate2FABackupCode(): string {
    return this.twoFactorAuthenticationService.generateBackupCode();
  }

  checkOtp(otp: string, secret: string): boolean {
    return this.twoFactorAuthenticationService.checkOtp(otp, secret);
  }
}
