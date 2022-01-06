import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";
import { BannerDto } from "../characters/banner.dto";

export abstract class BaseEventDto {
	@IsString()
	@MinLength(1)
	title: string;

	@IsBoolean()
	@IsOptional()
	mine: boolean;

	@IsString()
	details: string;

	@IsString()
	oocDetails: string;

	@IsNumber()
	startDateTime: number;

	@IsNumber()
	@IsOptional()
	endDateTime: number|null;

	@IsString()
	@IsOptional()
	link: string;

	@IsString()
	contact: string;

  @Type(() => BannerDto)
  @ValidateNested()
  @IsOptional()
  banner: BannerDto|null;

	@IsString()
	locationName: string;

	@IsString()
	locationAddress: string;

	@IsString()
	locationServer: string;

	@IsString()
	locationTags: string;
}
