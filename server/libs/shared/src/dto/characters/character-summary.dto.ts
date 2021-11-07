import { Race } from "@app/shared/enums/race.enum";

export interface CharacterSummaryDto {
	name: string;
	server: string;
	avatar: string;
	race: Race;
}
