import { UserConfirmEmailDto } from '@app/shared/dto/user/user-confirm-email.dto';
import { UserSignUpResponseDto } from '@app/shared/dto/user/user-sign-up-response.dto';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { Body, Controller, Post } from '@nestjs/common';
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
}
