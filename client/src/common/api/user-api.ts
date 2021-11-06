import { ForgotPasswordRequestDto } from '@app/shared/dto/user/forgot-password-request.dto';
import { LoginResponseDto } from '@app/shared/dto/user/login-response.dto';
import { ResetPasswordRequestDto } from '@app/shared/dto/user/reset-password-request.dto';
import { SessionDto } from '@app/shared/dto/user/session.dto';
import { UserConfirmEmailDto } from '@app/shared/dto/user/user-confirm-email.dto';
import { UserLogInDto } from '@app/shared/dto/user/user-log-in.dto';
import { UserSignUpResponseDto } from '@app/shared/dto/user/user-sign-up-response.dto';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { VerificationStatusDto } from '@app/shared/dto/user/verification-status.dto';
import { VerifyCharacterDto } from '@app/shared/dto/user/verify-character.dto';
import APITransport from './api-transport';

// Client for the user management API.
export default class UserAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('user');
  }

  async signUp(signupData: UserSignUpDto): Promise<UserSignUpResponseDto> {
    return this.transport.post<UserSignUpResponseDto>('signup', signupData);
  }

  async confirmEmail(confirmData: UserConfirmEmailDto): Promise<void> {
    await this.transport.post<UserSignUpResponseDto>(
      'confirm-email',
      confirmData
    );
  }

  async logIn(loginData: UserLogInDto): Promise<LoginResponseDto> {
    return this.transport.post<LoginResponseDto>('login', loginData);
  }

  async forgotPassword(
    forgotPasswordData: ForgotPasswordRequestDto
  ): Promise<void> {
    await this.transport.post<void>('forgot-password', forgotPasswordData);
  }

  async resetPassword(
    resetPasswordData: ResetPasswordRequestDto
  ): Promise<void> {
    await this.transport.post<void>('reset-password', resetPasswordData);
  }

  async getSession(): Promise<SessionDto> {
    return this.transport.authGet<SessionDto>('session');
  }

  async getVerificationStatus(characterId: number): Promise<VerificationStatusDto> {
    return this.transport.authGet<VerificationStatusDto>('verification-status', {
      characterId
    });
  }

  async verifyCharacter(characterData: VerifyCharacterDto): Promise<void> {
    return this.transport.authPost<void>('verify-character', characterData);
  }
}
