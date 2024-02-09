import SharedConstants from '@app/shared/SharedConstants';
import { IsString,  Matches, MinLength } from 'class-validator';

export class User2FAConfirmRequestDto {
  @IsString()
  @MinLength(SharedConstants.PASSWORD_MIN_LENGTH)
  readonly currentPassword: string;

  @IsString()
  @Matches(SharedConstants.OTP_REGEX)
  readonly otp: string;

  constructor(properties?: Readonly<User2FAConfirmRequestDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
