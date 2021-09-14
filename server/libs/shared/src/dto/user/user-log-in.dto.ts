import { IsString } from 'class-validator';

export class UserLogInDto {
  @IsString()
  readonly email: string;

  @IsString()
  readonly password: string;

  constructor(properties?: Readonly<UserLogInDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
