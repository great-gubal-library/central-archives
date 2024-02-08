import { IsOptional, IsString } from 'class-validator';

export class UserLogInDto {
  @IsString()
  readonly email: string;

  @IsString()
  readonly password: string;

  @IsString()
  @IsOptional()
  readonly otp?: string | null;

  constructor(properties?: Readonly<UserLogInDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
