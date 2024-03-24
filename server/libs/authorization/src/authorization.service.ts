import { authConfiguration } from '@app/configuration';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthorizationImplService } from './impl/authorization-impl.service';
import { AuthScope } from '../../shared/src/enums/oauth/auth-scope.enum';
import { UserInfo } from './model/user-info';
import { DateTime } from 'luxon';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class AuthorizationService {
  constructor(
    private jwtService: JwtService,
		private authService: AuthorizationImplService,
  ) {}

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
}
