import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { UserInfo } from '../auth/user-info';
import { CharactersService } from './characters.service';

@Controller('characters')
export class CharactersController {
	constructor(private charactersService: CharactersService) { }

	@Get('profile/:server/:name')
	@UseGuards(OptionalJwtAuthGuard)
	async getCharacterProfile(@Param('name') name: string, @Param('server') server: string, @CurrentUser() user?: UserInfo): Promise<CharacterProfileDto> {
		return this.charactersService.getCharacterProfile(name, server, user);
	}

	@Put('profile')
	@UseGuards(JwtAuthGuard)
	async saveCharacter(@Body() profile: CharacterProfileDto, @CurrentUser() user: UserInfo): Promise<void> {
		await this.charactersService.saveCharacter(profile, user);
	}
}
