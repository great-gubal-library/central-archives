import SharedConstants from '@app/shared/SharedConstants';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ChangeEmailRequestDto {
  @IsString()
  @MinLength(SharedConstants.PASSWORD_MIN_LENGTH)
  readonly currentPassword: string;

  @IsString()
  @IsEmail()
  readonly newEmail: string;

  constructor(properties?: Readonly<ChangeEmailRequestDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
