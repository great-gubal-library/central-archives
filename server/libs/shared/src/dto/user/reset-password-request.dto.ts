import SharedConstants from '@app/shared/shared-constants';
import { Match } from '@app/shared/validation/match.decorator';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordRequestDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(SharedConstants.PASSWORD_MIN_LENGTH)
  readonly password: string;

  @IsString()
  @Match('password', {
		message: 'passwords must match',
	})
  readonly confirmPassword: string;

  @IsString()
  readonly verificationCode: string;

  constructor(properties?: Readonly<ResetPasswordRequestDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
