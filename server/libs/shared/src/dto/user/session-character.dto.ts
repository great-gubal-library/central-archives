import { NewsRole } from "@app/shared/enums/news-role.enum";
import { Race } from "@app/shared/enums/race.enum";
import { Region } from "@app/shared/enums/region.enum";

export interface SessionCharacterDto {
  id: number;
  lodestoneId: number;
  name: string;
  server: string;
  region: Region;
  avatar: string;
  race: Race;
  newsRole: NewsRole;
  newsPseudonym: string | null;
  verified: boolean;
}
