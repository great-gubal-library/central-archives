import { CharacterSummaryDto } from "../characters/character-summary.dto";

export interface PlayerProfileDto {
	name: string;
	content: string;
	carrdProfile: string;
	characters: CharacterSummaryDto[];
}
