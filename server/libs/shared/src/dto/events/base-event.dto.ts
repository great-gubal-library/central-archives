import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";
import { BannerDto } from "../characters/banner.dto";
import { EventLocationDto } from "./event-location.dto";

export abstract class BaseEventDto {
	@IsString()
	@MinLength(1)
	title: string;

	@IsBoolean()
	@IsOptional()
	mine: boolean;

	@IsBoolean()
	@IsOptional()
	recurring: boolean;

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

	@Type(() => EventLocationDto)
	@ValidateNested({ each: true })
	@IsArray()
	locations: EventLocationDto[];
}
