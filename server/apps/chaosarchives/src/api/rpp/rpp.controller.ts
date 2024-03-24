import { AuthenticationService } from '@app/authentication/authentication.service';
import { AuthorizationService } from '@app/authorization/authorization.service';
import { CurrentUser } from '@app/authorization/decorators/current-user.decorator';
import { RoleRequired } from '@app/authorization/decorators/role-required.decorator';
import { Scope } from '@app/authorization/decorators/scope.decorator';
import { UserInfo } from '@app/authorization/model/user-info';
import { RppCharacterProfileDto } from '@app/shared/dto/rpp/rpp-character-profile.dto';
import { RppLogInDto } from '@app/shared/dto/rpp/rpp-log-in.dto';
import { RppLoginResponseDto } from '@app/shared/dto/rpp/rpp-login-response.dto';
import { Role } from '@app/shared/enums/role.enum';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RppService } from './rpp.service';
import { RppExtendLoginResponseDto } from '@app/shared/dto/rpp/rpp-extend-login-response.dto';
import { AuthScope } from '@app/shared/enums/oauth/auth-scope.enum';

@Controller('rpp')
export class RppController {
  constructor(
    private rppService: RppService,
    private authenticationService: AuthenticationService,
    private authorizationService: AuthorizationService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtain an access token using a Central Archives account',
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
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'One-time password required (when response `message` property has value `OTP_REQUIRED`)',
  })
  async login(@Body() request: RppLogInDto): Promise<RppLoginResponseDto> {
    const userId = await this.authenticationService.authenticateUser(request);

    return {
      accessToken: this.authorizationService.createAccessToken(userId, AuthScope.RPP),
    };
  }

  @Post('extend-login')
  @RoleRequired(Role.USER)
  @Scope(AuthScope.RPP)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Extend the login session, possibly obtaining a new access token.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RppLoginResponseDto,
    description:
      'Successfully returned the new access token (or null, indicating that the client should keep using the current one)',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid email or password',
  })
  @ApiBearerAuth()
  async extendLogin(@CurrentUser() user: UserInfo, @Req() request: any): Promise<RppExtendLoginResponseDto> {
    return {
      newAccessToken: this.authorizationService.reissueAccessTokenIfNeeded(user.id, request, AuthScope.RPP),
    };
  }

  @Get('profile/:server/:name')
  @ApiOperation({
    summary: 'Return a character profile by character name and server name',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RppCharacterProfileDto,
    description: 'Character found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Character not found',
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
    description: 'Character updated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Character not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'This is not your character',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid character data',
  })
  @ApiBearerAuth()
  async updateCharacterProfile(
    @Param('name') name: string,
    @Param('server') server: string,
    @Body() profile: RppCharacterProfileDto,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    await this.rppService.updateCharacterProfile(name, server, profile, user);
  }
}
