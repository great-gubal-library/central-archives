import SharedConstants from '@app/shared/SharedConstants';
import { IsString,   MinLength } from 'class-validator';

export class User2FARemoveRequestDto {
  @IsString()
  @MinLength(SharedConstants.PASSWORD_MIN_LENGTH)
  readonly currentPassword: string;

  constructor(properties?: Readonly<User2FARemoveRequestDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
