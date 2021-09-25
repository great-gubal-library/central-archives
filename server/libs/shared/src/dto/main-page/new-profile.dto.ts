import { Race } from "@app/shared/enums/race.enum";

export interface NewProfileDto {
	name: string;
	server: string;
	avatar: string;
	race: Race;
}
