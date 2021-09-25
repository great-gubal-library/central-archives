import { Character } from '@app/entity';
import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class MainPageService {
	private readonly MAX_NEW_PROFILES = 4;

	constructor(
		@InjectRepository(Character)
		private characterRepo: Repository<Character>
	) { }

	async getMainPageContent(): Promise<MainPageContentDto> {
		const newCharacters = await this.characterRepo.createQueryBuilder('character')
			.where('character.verifiedAt IS NOT NULL')
			.orderBy('character.verifiedAt', 'DESC')
			.innerJoinAndSelect('character.server', 'server')
			.limit(this.MAX_NEW_PROFILES)
			.select([ 'character.name', 'character.race', 'character.avatar', 'server.name' ])
			.getMany();

		return {
			newProfiles: newCharacters.map(character => ({
				name: character.name,
				race: character.race,
				avatar: character.avatar,
				server: character.server.name,
			})),
			news: [] // Will be loaded by NewsService instead
		};
	}
}
