
import { authConfiguration } from '@app/configuration';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthImplService } from '../impl/auth-impl.service';
import { AuthInfo } from '../model/auth-info';
import { AuthScope } from '../model/auth-scope.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthImplService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfiguration.jwtSecret,
    });
  }

  async validate(payload: { sub: number, scope?: AuthScope }): Promise<AuthInfo> {
    return {
      user: await this.authService.getUserInfo(payload.sub),
      scope: payload.scope || null,
    }
  }
}
