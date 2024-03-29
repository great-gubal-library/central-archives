import { authConfiguration } from '@app/configuration';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { ExtractJwt } from 'passport-jwt';
import { AuthScope } from '../../shared/src/enums/oauth/auth-scope.enum';
import { AuthorizationImplService } from './impl/authorization-impl.service';
import { JweService } from './impl/jwe.service';
import { UserInfo } from './model/user-info';

@Injectable()
export class AuthorizationService {
  constructor(
    private jweService: JweService,
    private authService: AuthorizationImplService,
  ) { }

  async createAccessToken(userId: number, scope?: AuthScope | null): Promise<string> {
    if (!scope) {
      return this.jweService.encrypt({
        sub: userId
      }, {
        expiresIn: authConfiguration.jwtExpiry,
      });
    }

    return this.jweService.encrypt({
      sub: userId,
      scope,
    }, {
      expiresIn: authConfiguration.scopedJwtExpiry,
    });
  }

  async reissueAccessTokenIfNeeded(userId: number, request: any, scope?: AuthScope | null): Promise<string | null> {
    const jwtString = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!jwtString) {
      throw new UnauthorizedException();
    }

    const jwt = await this.jweService.verify(jwtString);
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
