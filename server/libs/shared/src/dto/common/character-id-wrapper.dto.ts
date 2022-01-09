import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class CharacterIdWrapper {
	@Type(() => Number)
	@IsNumber()
	characterId: number;
}
