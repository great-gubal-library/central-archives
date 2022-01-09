import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class IdWrapper {
	@Type(() => Number)
	@IsNumber()
	id: number;
}
