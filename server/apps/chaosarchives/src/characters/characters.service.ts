import { Character } from '@app/entity';
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserInfo } from '../auth/user-info';

@Injectable()
export class CharactersService {
	constructor(@InjectRepository(Character) private characterRepo: Repository<Character>) {}

	async getCharacterProfile(name: string, server: string, @CurrentUser() user?: UserInfo): Promise<CharacterProfileDto> {
		const character = await this.characterRepo.createQueryBuilder('character')
			.innerJoinAndSelect('character.server', 'server')
			.innerJoinAndSelect('character.user', 'user')
			.where('character.verifiedAt IS NOT NULL')
			.andWhere('character.name = :name', { name })
			.andWhere('server.name = :server', { server })
			.select([ 'character', 'server.name', 'user.id' ])
			.getOne();

		if (!character) {
			throw new NotFoundException('Character not found');
		}

		return {
			id: character.id,
			mine: !!user && character.user.id === user.id,
			name: character.name,
			race: character.race,
			server: character.server.name,
			avatar: character.avatar,
			lodestoneId: character.lodestoneId,
			appearance: character.appearance,
			background: character.background,
			occupation: character.occupation,
			age: character.age,
			birthplace: character.birthplace,
			residence: character.residence,
			title: character.residence,
			nickname: character.nickname,
			motto: character.motto,
			loves: character.loves,
			hates: character.hates,
			motivation: character.motivation,
		};
	}
}
