import { Race } from "@app/shared/enums/race.enum";

export interface CharacterRefreshResultDto {
	name: string;
	race: Race;
	server: string;
	avatar: string;
}
