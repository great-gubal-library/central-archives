import { LoginDto } from '@app/shared/dto/user/login.dto';
import { SessionDto } from '@app/shared/dto/user/session.dto';
import { UserConfirmEmailDto } from '@app/shared/dto/user/user-confirm-email.dto';
import { UserSignUpResponseDto } from '@app/shared/dto/user/user-sign-up-response.dto';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TokenService } from '../auth/token.service';
import { UserInfo } from '../auth/user-info';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  @Post('signup')
  async signUp(
    @Body() signupData: UserSignUpDto,
  ): Promise<UserSignUpResponseDto> {
    return this.userService.signUp(signupData);
  }

  @Post('confirm-email')
  async confirmEmail(
    @Body() confirmEmailData: UserConfirmEmailDto,
  ): Promise<void> {
    await this.userService.confirmEmail(confirmEmailData.code);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@CurrentUser() user: UserInfo): Promise<LoginDto> {
    return {
      accessToken: this.tokenService.createAccessToken(user.id),
      session: this.userService.toSession(user),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  async getSession(@CurrentUser() user: UserInfo): Promise<SessionDto> {
    return this.userService.toSession(user);
  }
}
