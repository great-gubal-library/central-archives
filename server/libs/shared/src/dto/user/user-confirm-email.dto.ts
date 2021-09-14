import { IsString } from 'class-validator';

export class UserConfirmEmailDto {
  @IsString()
  readonly code: string;

  constructor(properties?: Readonly<UserConfirmEmailDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
