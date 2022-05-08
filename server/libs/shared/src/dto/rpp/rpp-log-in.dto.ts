import { IsString } from 'class-validator';
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

  constructor(properties?: Readonly<RppLogInDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
