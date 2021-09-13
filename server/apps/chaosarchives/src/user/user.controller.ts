import { LoginResponseDto } from '@app/shared/dto/user/login-response.dto';
import { SessionDto } from '@app/shared/dto/user/session.dto';
import { UserConfirmEmailDto } from '@app/shared/dto/user/user-confirm-email.dto';
import { UserSignUpResponseDto } from '@app/shared/dto/user/user-sign-up-response.dto';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { VerifyCharacterDto } from '@app/shared/dto/user/verify-character.dto';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PublicAuthService } from '../auth/public-auth.service';
import { UserInfo } from '../auth/user-info';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private publicAuthService: PublicAuthService,
  ) {}

  @Post('signup')
  async signUp(
    @Body() signupData: UserSignUpDto,
  ): Promise<UserSignUpResponseDto> {
    const { userId, characterVerificationCode } = await this.userService.signUp(signupData);
    const accessToken = this.publicAuthService.createAccessToken(userId);
    const userInfo = await this.publicAuthService.getUserInfo(userId);

    return {
      characterVerificationCode,
      accessToken,
      session: this.userService.toSession(userInfo)
    }
  }

  @Post('confirm-email')
  async confirmEmail(
    @Body() confirmEmailData: UserConfirmEmailDto,
  ): Promise<void> {
    await this.userService.confirmEmail(confirmEmailData.code);
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
  async getSession(@CurrentUser() user: UserInfo): Promise<SessionDto> {
    return this.userService.toSession(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-character')
  async verifyCharacter(@CurrentUser() user: UserInfo, @Body() verifyData: VerifyCharacterDto): Promise<void> {
    await this.userService.verifyCharacter(user, verifyData);
  }
}
