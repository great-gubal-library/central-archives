import { IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RppLoginResponseDto {
	@ApiProperty({
    description: 'Limited scope access token for the RPP API',
  })
	@IsString()
	accessToken: string;
}
