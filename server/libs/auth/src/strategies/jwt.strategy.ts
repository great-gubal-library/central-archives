
import { authConfiguration } from '@app/configuration';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthImplService } from '../impl/auth-impl.service';
import { AuthInfo } from '../model/auth-info';
import { AuthScope } from '../model/auth-scope.enum';
import { DateTime } from 'luxon';

interface JwtPayload {
  sub: number;
  iat: number;
  scope?: AuthScope;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthImplService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfiguration.jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthInfo> {
    const user = await this.authService.getUserInfo(payload.sub);

    if (user.tokensValidAfter && payload.iat * 1000 < user.tokensValidAfter) {
      throw new UnauthorizedException('Your login has expired');
    }

    return {
      user,
      scope: payload.scope || null,
    }
  }
}
