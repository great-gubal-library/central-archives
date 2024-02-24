import { Type } from "class-transformer";
import { IsJWT, IsNumber, IsOptional, IsString, Matches } from "class-validator";

export class HsspRequestDto {
  @IsString()
  @IsJWT()
  accessToken: string;

  @Type(() => Number)
	@IsNumber()
  @IsOptional()
	readonly currentCharacterId?: number;

  @IsString()
  @Matches(/^\/[A-Za-z0-9'?=/-]*$/)
  redirectPath: string;

  constructor(properties?: Readonly<HsspRequestDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
