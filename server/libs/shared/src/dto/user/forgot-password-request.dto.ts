import { IsString } from 'class-validator';

export class ForgotPasswordRequestDto {
  @IsString()
  readonly email: string;

  constructor(properties?: Readonly<ForgotPasswordRequestDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
