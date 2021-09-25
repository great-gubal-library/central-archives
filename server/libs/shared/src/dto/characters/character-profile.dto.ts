import { Race } from "@app/shared/enums/race.enum";

export interface CharacterProfileDto {
	id: number;
	mine: boolean;
	name: string;
	race: Race;
	server: string;
	avatar: string;
	lodestoneId: number;

	// RP fields
	appearance: string;
	background: string;
	occupation: string;
	age: string;
	birthplace: string;
	residence: string;
	title: string;
	nickname: string;
	motto: string;
	loves: string;
	hates: string;
	motivation: string;
}
