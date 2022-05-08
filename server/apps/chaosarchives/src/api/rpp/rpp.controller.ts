import { AuthService } from "@app/auth/auth.service";
import { CurrentUser } from "@app/auth/decorators/current-user.decorator";
import { AuthScope } from "@app/auth/model/auth-scope.enum";
import { UserInfo } from "@app/auth/model/user-info";
import { RppCharacterProfileDto } from "@app/shared/dto/rpp/rpp-character-profile.dto";
import { RppLogInDto } from "@app/shared/dto/rpp/rpp-log-in.dto";
import { RppLoginResponseDto } from "@app/shared/dto/rpp/rpp-login-response.dto";
import { Controller, Get, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
	ApiBody,
	ApiOperation,
	ApiResponse,
} from '@nestjs/swagger';
import { RppService } from "./rpp.service";

@Controller('rpp')
export class RppController {
	constructor(private rppService: RppService, private authService: AuthService) {}

	@Post('login')
	@UseGuards(AuthGuard('local'))
	@ApiOperation({
		summary: 'Obtain an access token using a Chaos Archives account',
	})
	@ApiBody({
		description: 'Login credentials',
		type: RppLogInDto,
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: RppLoginResponseDto,
		description: 'Successfully logged in',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid email or password',
	})
  async login(@CurrentUser() user: UserInfo): Promise<RppLoginResponseDto> {
    return {
      accessToken: this.authService.createScopedAccessToken(user.id, AuthScope.RPP),
    };
  }

	@Get('profile/:server/:name')
	@ApiOperation({
		summary: 'Return a character profile by character name and server name',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: RppCharacterProfileDto,
		description: 'Character found'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Character not found'
	})
  async getCharacterProfile(
    @Param('name') name: string,
    @Param('server') server: string,
  ): Promise<RppCharacterProfileDto> {
    return this.rppService.getCharacterProfile(name, server);
  }
}
