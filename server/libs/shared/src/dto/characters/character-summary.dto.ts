import { NewsRole } from "@app/shared/enums/news-role.enum";
import { Race } from "@app/shared/enums/race.enum";

export interface CharacterSummaryDto {
	name: string;
	occupation?: string;
	server: string;
	avatar: string;
	race: Race;
	newsRole?: NewsRole;
}
