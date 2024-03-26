import SharedConstants from '@app/shared/shared-constants';
import { IsEmail, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class UserSignUpDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(SharedConstants.PASSWORD_MIN_LENGTH)
  readonly password: string;

  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  readonly lodestoneId: number;

  constructor(properties?: Readonly<UserSignUpDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
