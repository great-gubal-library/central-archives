import { AuthService } from '@app/auth/auth.service';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { UserInfo } from '@app/auth/model/user-info';
import { ChangeEmailRequestDto } from '@app/shared/dto/user/change-email-request.dto';
import { ChangePasswordRequestDto } from '@app/shared/dto/user/change-password-request.dto';
import { ForgotPasswordRequestDto } from '@app/shared/dto/user/forgot-password-request.dto';
import { LoginResponseDto } from '@app/shared/dto/user/login-response.dto';
import { ResetPasswordRequestDto } from '@app/shared/dto/user/reset-password-request.dto';
import { SessionDto } from '@app/shared/dto/user/session.dto';
import { UserConfirmEmailDto } from '@app/shared/dto/user/user-confirm-email.dto';
import { UserEmailInfoDto } from '@app/shared/dto/user/user-email.info.dto';
import { UserSignUpResponseDto } from '@app/shared/dto/user/user-sign-up-response.dto';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { VerificationStatusDto } from '@app/shared/dto/user/verification-status.dto';
import { VerifyCharacterDto } from '@app/shared/dto/user/verify-character.dto';
import {
  Body,
  Controller,
  Get, ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { SessionResponseDto } from '@app/shared/dto/user/session-response.dto';
import { NewAccessTokenResponseDto } from '@app/shared/dto/user/new-access-token-response.dto';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private publicAuthService: AuthService,
  ) {}

  @Post('signup')
  async signUp(
    @Body() signupData: UserSignUpDto,
  ): Promise<UserSignUpResponseDto> {
    const { userId, characterVerificationCode } = await this.userService.signUp(
      signupData,
    );
    const accessToken = this.publicAuthService.createAccessToken(userId);
    const userInfo = await this.publicAuthService.getUserInfo(userId);

    return {
      characterVerificationCode,
      accessToken,
      session: this.userService.toSession(userInfo),
    };
  }

  @Post('confirm-email')
  async confirmEmail(
    @Body() confirmEmailData: UserConfirmEmailDto,
  ): Promise<void> {
    const userId = await this.userService.confirmEmail(confirmEmailData.code);
    await this.publicAuthService.notifyUserChanged(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-confirmation-email')
  async resendConfirmationEmail(@CurrentUser() user: UserInfo): Promise<void> {
    await this.userService.resendConfirmationEmail(user);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@CurrentUser() user: UserInfo): Promise<LoginResponseDto> {
    return {
      accessToken: this.publicAuthService.createAccessToken(user.id),
      session: this.userService.toSession(user),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  async getSession(@CurrentUser() user: UserInfo, @Req() request: any): Promise<SessionResponseDto> {
    return {
      session: this.userService.toSession(user),
      newAccessToken: this.publicAuthService.reissueAccessTokenIfNeeded(user.id, request),
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
  async verifyCharacter(
    @CurrentUser() user: UserInfo,
    @Body() verifyData: VerifyCharacterDto,
  ): Promise<void> {
    await this.userService.verifyCharacter(user, verifyData);
    await this.publicAuthService.notifyUserChanged(user.id);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() request: ForgotPasswordRequestDto,
  ): Promise<void> {
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
    await this.publicAuthService.notifyUserChanged(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-everywhere')
  async logoutEverywhere(@CurrentUser() user: UserInfo): Promise<NewAccessTokenResponseDto> {
    await this.userService.logoutEverywhere(user);
    await this.publicAuthService.notifyUserChanged(user.id);

    return {
      newAccessToken: this.publicAuthService.createAccessToken(user.id),
    };
  }
}
