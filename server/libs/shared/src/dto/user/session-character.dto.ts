import { Race } from "@app/shared/enums/race.enum";

export interface SessionCharacterDto {
  id: number;
  lodestoneId: number;
  name: string;
  server: string;
  avatar: string;
  race: Race;
  verified: boolean;
}
