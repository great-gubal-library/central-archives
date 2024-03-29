import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Matches } from "class-validator";

export class HsspRequestDto {
  @IsString()
  accessToken: string;

  @Type(() => Number)
	@IsNumber()
  @IsOptional()
	readonly currentCharacterId?: number;

  @IsString()
  @Matches(/^\/[A-Za-z0-9'/_-]*(?:\?.*)?$/)
  redirectPath: string;

  constructor(properties?: Readonly<HsspRequestDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
