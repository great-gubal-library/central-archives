
import { authConfiguration } from '@app/configuration';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthInfo } from '../model/auth-info';
import { JwtStrategyImpl } from './jwt-strategy.impl';
import { JwtPayload } from '../model/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private impl: JwtStrategyImpl) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfiguration.jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthInfo> {
    return this.impl.validate(payload);
  }
}
