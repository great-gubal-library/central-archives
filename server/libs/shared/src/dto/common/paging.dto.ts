import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class PagingDto {
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	readonly offset?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	readonly limit?: number;
}
