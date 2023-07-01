import { authConfiguration } from '@app/configuration';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthImplService } from './impl/auth-impl.service';
import { AuthScope } from './model/auth-scope.enum';
import { UserInfo } from './model/user-info';
import { DateTime, Duration } from 'luxon';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
		private authService: AuthImplService,
  ) {}

	createAccessToken(userId: number): string {
		return this.jwtService.sign({
			sub: userId
		});
	}

	createScopedAccessToken(userId: number, scope: AuthScope): string {
		return this.jwtService.sign({
			sub: userId,
			scope,
		}, {
			expiresIn: authConfiguration.scopedJwtExpiry,
		});
	}

	reissueScopedAccessTokenIfNeeded(userId: number, scope: AuthScope, request: any): string|null {
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
			return this.createScopedAccessToken(userId, scope);
		}

		return null;
	}

	getUserInfo(userId: number): Promise<UserInfo> {
		return this.authService.getUserInfo(userId);
	}

	async notifyUserChanged(userId: number): Promise<void> {
		await this.authService.notifyUserChanged(userId);
	}
}
