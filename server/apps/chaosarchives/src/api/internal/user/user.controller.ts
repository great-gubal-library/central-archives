import { AuthService } from '@app/auth/auth.service';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { UserInfo } from '@app/auth/model/user-info';
import { ChangeEmailRequestDto } from '@app/shared/dto/user/change-email-request.dto';
import { ChangePasswordRequestDto } from '@app/shared/dto/user/change-password-request.dto';
import { ForgotPasswordRequestDto } from '@app/shared/dto/user/forgot-password-request.dto';
import { LoginResponseDto } from '@app/shared/dto/user/login-response.dto';
import { ResetPasswordRequestDto } from '@app/shared/dto/user/reset-password-request.dto';
import { UserConfirmEmailDto } from '@app/shared/dto/user/user-confirm-email.dto';
import { UserEmailInfoDto } from '@app/shared/dto/user/user-email.info.dto';
import { UserSignUpResponseDto } from '@app/shared/dto/user/user-sign-up-response.dto';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { VerificationStatusDto } from '@app/shared/dto/user/verification-status.dto';
import { VerifyCharacterDto } from '@app/shared/dto/user/verify-character.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotImplementedException,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SessionResponseDto } from '@app/shared/dto/user/session-response.dto';
import { NewAccessTokenResponseDto } from '@app/shared/dto/user/new-access-token-response.dto';
import { UserLogInDto } from '@app/shared/dto/user/user-log-in.dto';
import { User2FAStatusDto } from '@app/shared/dto/user/2fa/user-2fa-status.dto';
import { User2FAConfirmRequestDto } from '@app/shared/dto/user/2fa/user-2fa-confirm-request.dto';
import { User2FAConfirmResponseDto } from '@app/shared/dto/user/2fa/user-2fa-confirm-response.dto';
import { User2FARemoveRequestDto } from '@app/shared/dto/user/2fa/user-2fa-remove-request.dto';
import { User2FAService } from './user-2fa.service';
import { ClientRegion } from 'apps/chaosarchives/src/common/client-region.decorator';
import { SiteRegion } from '@app/shared/enums/region.enum';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private user2FAService: User2FAService,
  ) {}

  @Post('signup')
  async signUp(@Body() signupData: UserSignUpDto, @ClientRegion() region: SiteRegion): Promise<UserSignUpResponseDto> {
    const { userId, characterVerificationCode } = await this.userService.signUp(signupData, region);
    const accessToken = this.authService.createAccessToken(userId);
    const userInfo = await this.authService.getUserInfo(userId);

    return {
      characterVerificationCode,
      accessToken,
      session: this.userService.toSession(userInfo),
    };
  }

  @Post('confirm-email')
  async confirmEmail(@Body() confirmEmailData: UserConfirmEmailDto): Promise<void> {
    const userId = await this.userService.confirmEmail(confirmEmailData.code);
    await this.authService.notifyUserChanged(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-confirmation-email')
  async resendConfirmationEmail(@CurrentUser() user: UserInfo): Promise<void> {
    await this.userService.resendConfirmationEmail(user);
  }

  @Post('login')
  async login(@Body() request: UserLogInDto): Promise<LoginResponseDto> {
    const user = await this.authService.authenticateUser(request);

    return {
      accessToken: this.authService.createAccessToken(user.id),
      session: this.userService.toSession(user),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  async getSession(@CurrentUser() user: UserInfo, @Req() request: any): Promise<SessionResponseDto> {
    return {
      session: this.userService.toSession(user),
      newAccessToken: this.authService.reissueAccessTokenIfNeeded(user.id, request),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('verification-status')
  async getVerificationStatus(
    @CurrentUser() user: UserInfo,
    @Query('characterId', ParseIntPipe) characterId: number,
  ): Promise<VerificationStatusDto> {
    return this.userService.getVerificationStatus(user, characterId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-character')
  async verifyCharacter(@CurrentUser() user: UserInfo, @Body() verifyData: VerifyCharacterDto): Promise<void> {
    await this.userService.verifyCharacter(user, verifyData);
    await this.authService.notifyUserChanged(user.id);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() request: ForgotPasswordRequestDto): Promise<void> {
    await this.userService.forgotPassword(request);
  }

  @Post('reset-password')
  async resetPassword(@Body() request: ResetPasswordRequestDto): Promise<void> {
    await this.userService.resetPassword(request);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Body() request: ChangePasswordRequestDto, @CurrentUser() user: UserInfo): Promise<void> {
    await this.userService.changePassword(request, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('email')
  async getEmail(@CurrentUser() user: UserInfo): Promise<UserEmailInfoDto> {
    return this.userService.getEmail(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-email')
  async changeEmail(@Body() request: ChangeEmailRequestDto, @CurrentUser() user: UserInfo): Promise<void> {
    await this.userService.changeEmail(request, user);
  }

  @Post('confirm-new-email')
  async confirmNewEmail(@Body() confirmEmailData: UserConfirmEmailDto): Promise<void> {
    const userId = await this.userService.confirmNewEmail(confirmEmailData.code);
    await this.authService.notifyUserChanged(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-everywhere')
  async logoutEverywhere(@CurrentUser() user: UserInfo): Promise<NewAccessTokenResponseDto> {
    await this.userService.logoutEverywhere(user);
    await this.authService.notifyUserChanged(user.id);

    return {
      newAccessToken: this.authService.createAccessToken(user.id),
    };
  }

  // 2FA settings

  @UseGuards(JwtAuthGuard)
  @Get('2fa')
  async get2FAStatus(@CurrentUser() user: UserInfo, @ClientRegion() region: SiteRegion): Promise<User2FAStatusDto> {
    return this.user2FAService.get2FAStatus(user, region);
  }

  @UseGuards(JwtAuthGuard)
  @Put('2fa')
  async request2FA(@CurrentUser() user: UserInfo, @ClientRegion() region: SiteRegion): Promise<User2FAStatusDto> {
    return this.user2FAService.request2FA(user, region);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('2fa')
  async cancel2FA(@CurrentUser() user: UserInfo): Promise<User2FAStatusDto> {
    return this.user2FAService.cancel2FA(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/confirm')
  async confirm2FA(
    @Body() request: User2FAConfirmRequestDto,
    @CurrentUser() user: UserInfo,
  ): Promise<User2FAConfirmResponseDto> {
    return this.user2FAService.confirm2FA(request, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/backup-code')
  async regenerate2FABackupCode(@Body() request: User2FARemoveRequestDto, @CurrentUser() user: UserInfo): Promise<User2FAConfirmResponseDto> {
    return this.user2FAService.regenerate2FABackupCode(request, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/remove')
  async remove2FA(@Body() request: User2FARemoveRequestDto, @CurrentUser() user: UserInfo): Promise<User2FAStatusDto> {
    return this.user2FAService.remove2FA(request, user);
  }

  // end 2FA settings
}
