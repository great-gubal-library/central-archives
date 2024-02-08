import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RppLogInDto {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsString()
  readonly email: string;

  @ApiProperty({
    description: 'User password',
    example: 'correct horse battery staple',
  })
  @IsString()
  readonly password: string;

  @ApiProperty({
    description: 'One-time password (if 2FA is set up)',
    example: 'correct horse battery staple',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly otp?: string | null;

  constructor(properties?: Readonly<RppLogInDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
