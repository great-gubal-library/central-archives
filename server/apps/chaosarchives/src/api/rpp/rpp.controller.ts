import { AuthService } from "@app/auth/auth.service";
import { CurrentUser } from "@app/auth/decorators/current-user.decorator";
import { Scope } from "@app/auth/decorators/scope.decorator";
import { JwtAuthGuard } from "@app/auth/guards/jwt-auth.guard";
import { AuthScope } from "@app/auth/model/auth-scope.enum";
import { UserInfo } from "@app/auth/model/user-info";
import { RppLoginResponseDto } from "@app/shared/dto/rpp/rpp-login-response.dto";
import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Controller('rpp')
export class RppController {
	constructor(private authService: AuthService) {}

	@Get()
	@Scope(AuthScope.RPP)
	@UseGuards(JwtAuthGuard)
	async getDefault(): Promise<Record<string, never>> {
		return {};
	}

	@Post('login')
	@UseGuards(AuthGuard('local'))
  async login(@CurrentUser() user: UserInfo): Promise<RppLoginResponseDto> {
    return {
      accessToken: this.authService.createScopedAccessToken(user.id, AuthScope.RPP),
    };
  }
}
