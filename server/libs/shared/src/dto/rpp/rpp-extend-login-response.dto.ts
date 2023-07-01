import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RppExtendLoginResponseDto {
	@ApiProperty({
    description: 'Limited scope access token for the RPP API. Can be null, in which case the client should continue using the current acces token.',
  })
	@IsString()
	@IsOptional()
	newAccessToken: string|null;
}
