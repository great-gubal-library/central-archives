import { Injectable } from "@nestjs/common";
import { totp, authenticator } from "otplib";
import QRCode from 'qrcode';

const BACKUP_CODE_REGEX = /^[0-9A-Z]{16}$/;
const ISSUER = 'Chaos Archives';

@Injectable()
export class TwoFactorAuthService {
  generateSecret(): string {
    return authenticator.generateSecret();
  }

  generateBackupCode(): string {
    return this.generateSecret().substring(0, 16);
  }

  async getQRCodeDataUrl(username: string, secret: string): Promise<string> {
    return QRCode.toDataURL(totp.keyuri(username, ISSUER, secret));
  }

  isBackupCode(otp: string): boolean {
    return BACKUP_CODE_REGEX.test(otp);
  }

  checkOtp(secret: string, otp: string): boolean {
    return totp.check(otp, secret);
  }
}
