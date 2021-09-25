import { Race } from "@app/shared/enums/race.enum";

export interface CharacterProfileDto {
	id: number;
	mine: boolean;
	name: string;
	race: Race;
	server: string;
	avatar: string;
	lodestoneId: number;
}
