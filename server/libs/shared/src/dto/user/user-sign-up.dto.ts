import SharedConstants from '@app/shared/SharedConstants';
import { Match } from '@app/shared/validation/match.decorator';
import { IsEmail, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class UserSignUpDto {
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

  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  readonly lodestoneId: number;

  constructor(properties?: Readonly<UserSignUpDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
