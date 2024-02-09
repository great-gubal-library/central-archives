import { Injectable } from "@nestjs/common";
import { TOTP } from "otpauth";
import QRCode from 'qrcode';

const BACKUP_CODE_REGEX = /^[0-9A-Z]{16}$/;
const ISSUER = 'Chaos Archives';

@Injectable()
export class TwoFactorAuthService {
  generateSecret(): string {
    return new TOTP().secret.base32;
  }

  generateBackupCode(): string {
    return this.generateSecret().substring(0, 16);
  }

  async getQRCodeDataUrl(username: string, secret: string): Promise<string> {
    return QRCode.toDataURL(new TOTP({ issuer: ISSUER, label: username, secret }).toString());
  }

  isBackupCode(otp: string): boolean {
    return BACKUP_CODE_REGEX.test(otp);
  }

  checkOtp(otp: string, secret: string): boolean {
    return new TOTP({ issuer: ISSUER, secret }).validate({ token: otp }) !== null;
  }
}
