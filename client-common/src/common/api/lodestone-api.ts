import APITransport from "./api-transport";
import { CharacterInfo, CharacterSearchEntry, PagedResult } from "@app/shared/dto/lodestone";

export default class LodestoneAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath("lodestone");
  }

  async searchCharacters(
    name: string,
    datacenter: string
  ): Promise<PagedResult<CharacterSearchEntry>> {
    return this.transport.get<PagedResult<CharacterSearchEntry>>(
      `search/characters`,
      {
        name,
        datacenter,
      }
    );
  }

  async getCharacter(lodestoneId: number): Promise<CharacterInfo | null> {
    return this.transport.get<CharacterInfo | null>('character', { lodestoneId });
  }
}
