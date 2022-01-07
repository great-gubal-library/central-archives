import { Race } from "@app/shared/enums/race.enum";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PagingDto } from "../common/paging.dto";

export class CharacterProfileFilterDto extends PagingDto {
	@IsString()
	@IsOptional()
	searchQuery?: string;

	@IsEnum(Race)
	@IsOptional()
	race?: Race;
}
