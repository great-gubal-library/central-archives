import { Character } from '@app/entity';
import { CharacterProfileDto } from '@app/shared/dto/character/character-profile.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class CharactersService {
	constructor(@InjectRepository(Character) private characterRepository: Repository<Character>) {}

	async getCharacterProfile(name: string, server: string): Promise<CharacterProfileDto> {
		const character = await this.characterRepository.findOne({
			where: {
				name,
				server: {
					name: server
				},
				verifiedAt: Not(IsNull()),
			},
			relations: [ 'server' ]
		});

		if (!character) {
			throw new NotFoundException('Character not found');
		}

		return {
			id: character.id,
			mine: false,
			name: character.name,
			race: character.race,
			server: character.server.name,
			avatar: character.avatar,
			lodestoneId: character.lodestoneId,
		};
	}
}
