import SharedConstants from '@app/shared/SharedConstants';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordRequestDto {
  @IsString()
  @MinLength(SharedConstants.PASSWORD_MIN_LENGTH)
  readonly currentPassword: string;

  @IsString()
  @MinLength(SharedConstants.PASSWORD_MIN_LENGTH)
  readonly newPassword: string;

  constructor(properties?: Readonly<ChangePasswordRequestDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
