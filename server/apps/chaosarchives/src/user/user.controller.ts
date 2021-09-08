import { SessionDto } from '@app/shared/dto/user/session.dto';
import { UserConfirmEmailDto } from '@app/shared/dto/user/user-confirm-email.dto';
import { UserSignUpResponseDto } from '@app/shared/dto/user/user-sign-up-response.dto';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { Role } from '@app/shared/enums/role.enum';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

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
  async login(): Promise<SessionDto> {
    return {
      role: Role.USER
    };
  }
}
