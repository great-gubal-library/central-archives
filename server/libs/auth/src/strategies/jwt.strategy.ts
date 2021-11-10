
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { authConfiguration } from '@app/configuration';
import { AuthImplService } from '../impl/auth-impl.service';
import { UserInfo } from '../model/user-info';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthImplService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfiguration.jwtSecret,
    });
  }

  async validate(payload: { sub: number }): Promise<UserInfo> {
    return this.authService.getUserInfo(payload.sub);
  }
}
