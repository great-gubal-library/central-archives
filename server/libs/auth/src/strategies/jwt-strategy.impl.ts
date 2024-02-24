import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthImplService } from "../impl/auth-impl.service";
import { AuthInfo } from "../model/auth-info";
import { JwtPayload } from "../model/jwt-payload";

@Injectable()
export class JwtStrategyImpl {
  constructor(private authService: AuthImplService) { }

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
