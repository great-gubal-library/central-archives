import { CharacterProfileDto } from '@app/shared/dto/character/character-profile.dto';
import { Controller, Get, Param } from '@nestjs/common';
import { CharactersService } from './characters.service';

@Controller('characters')
export class CharactersController {
	constructor(private charactersService: CharactersService) { }

	@Get('profile/:server/:name')
	async getCharacterProfile(@Param('name') name: string, @Param('server') server: string): Promise<CharacterProfileDto> {
		return this.charactersService.getCharacterProfile(name, server);
	}
}
