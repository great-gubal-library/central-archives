import { StoryType } from "@app/shared/enums/story-type.enum";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PagingDto } from "../common/paging.dto";

export class StoryFilterDto extends PagingDto {
	@IsString()
	@IsOptional()
	searchQuery?: string;

	@IsString()
	@IsOptional()
	tag?: string;

	@IsEnum(StoryType)
	@IsOptional()
	type?: StoryType;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	characterId?: number;
}
