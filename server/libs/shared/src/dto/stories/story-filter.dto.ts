import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { PagingDto } from "../common/paging.dto";

export class StoryFilterDto extends PagingDto {
	@IsString()
	@IsOptional()
	searchQuery?: string;

	@IsString()
	@IsOptional()
	tag?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	characterId?: number;
}
