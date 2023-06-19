import { AuthService } from "@app/auth/auth.service";
import { CurrentUser } from "@app/auth/decorators/current-user.decorator";
import { RoleRequired } from "@app/auth/decorators/role-required.decorator";
import { Scope } from "@app/auth/decorators/scope.decorator";
import { AuthScope } from "@app/auth/model/auth-scope.enum";
import { UserInfo } from "@app/auth/model/user-info";
import { RppCharacterProfileDto } from "@app/shared/dto/rpp/rpp-character-profile.dto";
import { RppLogInDto } from "@app/shared/dto/rpp/rpp-log-in.dto";
import { RppLoginResponseDto } from "@app/shared/dto/rpp/rpp-login-response.dto";
import { Role } from "@app/shared/enums/role.enum";
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
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
	@HttpCode(HttpStatus.OK)
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
    @Query('sessionToken') sessionToken: string,
  ): Promise<RppCharacterProfileDto> {
    return this.rppService.getCharacterProfile(name, server, sessionToken);
  }

	@Put('profile/:server/:name')
	@RoleRequired(Role.USER)
	@Scope(AuthScope.RPP)
	@ApiOperation({
		summary: 'Update a character profile by character name and server name',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: RppCharacterProfileDto,
		description: 'Character updated'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Character not found'
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'This is not your character'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid character data'
	})
  async updateCharacterProfile(
    @Param('name') name: string,
    @Param('server') server: string,
		@Body() profile: RppCharacterProfileDto,
		@CurrentUser() user: UserInfo,
  ): Promise<void> {
    await this.rppService.updateCharacterProfile(name, server, profile, user);
  }
}
