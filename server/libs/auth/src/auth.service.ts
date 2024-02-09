import { authConfiguration } from '@app/configuration';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthImplService } from './impl/auth-impl.service';
import { AuthScope } from './model/auth-scope.enum';
import { UserInfo } from './model/user-info';
import { DateTime } from 'luxon';
import { ExtractJwt } from 'passport-jwt';
import { LoginCredentials } from './model/login-credentials';
import { TwoFactorAuthService } from './impl/two-factor-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
		private authService: AuthImplService,
    private twoFactorAuthService: TwoFactorAuthService,
  ) {}

  async authenticateUser(credentials: LoginCredentials): Promise<UserInfo> {
    return this.authService.validateUser(credentials);
  }

	createAccessToken(userId: number, scope?: AuthScope | null): string {
    if (!scope) {
      return this.jwtService.sign({
        sub: userId
      });
    }

		return this.jwtService.sign({
			sub: userId,
			scope,
		}, {
			expiresIn: authConfiguration.scopedJwtExpiry,
		});
	}

	reissueAccessTokenIfNeeded(userId: number, request: any, scope?: AuthScope | null): string|null {
		const jwtString = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

		if (!jwtString) {
			throw new UnauthorizedException();
		}

		const jwt = this.jwtService.decode(jwtString, {
			json: true,
		}) as { [k: string]: any };
		const expiresAt = jwt.exp;

		if (!expiresAt) {
			return null;
		}

		const issuedAt = jwt.iat;

		if (!issuedAt) {
			throw new UnauthorizedException('Invalid JWT');
		}

		const issuedAtDate = DateTime.fromSeconds(issuedAt, { zone: 'UTC' });
		const expiresAtDate = DateTime.fromSeconds(expiresAt, { zone: 'UTC' });
		const now = DateTime.utc();

		if (expiresAtDate.diff(now).toMillis() < expiresAtDate.diff(issuedAtDate).toMillis() / 2) {
			// The JWT has outlived half its life
      return this.createAccessToken(userId, scope);
		}

		return null;
	}

	getUserInfo(userId: number): Promise<UserInfo> {
		return this.authService.getUserInfo(userId);
	}

	async notifyUserChanged(userId: number): Promise<void> {
		await this.authService.notifyUserChanged(userId);
	}

  async getQRCodeDataUrl(username: string, secret: string): Promise<string> {
    return this.twoFactorAuthService.getQRCodeDataUrl(username, secret);
  }

  generate2FASecret(): string {
    return this.twoFactorAuthService.generateSecret();
  }
}
