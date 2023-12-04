import { Controller, Get, ParseIntPipe, Query } from "@nestjs/common";
import { LodestoneService } from "./lodestone.service";
import { CharacterInfo } from "@app/shared/dto/lodestone";

@Controller('lodestone')
export class LodestoneController {
  constructor(private service: LodestoneService) { }

  @Get('search/characters')
  async searchCharacters(
    @Query('name') name: string,
    @Query('datacenter') datacenter: string,
  ) {
    return this.service.searchCharacters(name, datacenter);
  }

  @Get('character')
  async getCharacter(
    @Query('lodestoneId', ParseIntPipe) lodestoneId: number,
  ): Promise<CharacterInfo | null> {
    return this.service.getCharacter(lodestoneId);
  }
}
