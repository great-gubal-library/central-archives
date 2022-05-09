import { NewsRole } from "@app/shared/enums/news-role.enum";
import { Race } from "@app/shared/enums/race.enum";

export interface SessionCharacterDto {
  id: number;
  lodestoneId: number;
  name: string;
  server: string;
  avatar: string;
  race: Race;
  newsRole: NewsRole;
  verified: boolean;
}
