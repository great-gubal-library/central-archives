import { NewsRole } from "@app/shared/enums/news-role.enum";
import { Race } from "@app/shared/enums/race.enum";
import { Region } from "@app/shared/enums/region.enum";

export class UserCharacterInfo {
  readonly id: number;

  readonly lodestoneId: number;

  readonly name: string;

  readonly server: string;

  readonly region: Region;

  readonly avatar: string;

  readonly race: Race;

  readonly newsRole: NewsRole;

  readonly newsPseudonym: string | null;

  readonly verified: boolean;

  constructor(properties: Readonly<UserCharacterInfo>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
