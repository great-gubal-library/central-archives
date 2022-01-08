import { Character } from '@app/entity';
import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';
import { CharacterSummaryDto } from '@app/shared/dto/characters/character-summary.dto';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';

@Injectable()
export class MainPageService {
	private readonly MAX_NEW_PROFILES = 4;

	private readonly MAX_NEW_IMAGES = 8;

	constructor(
		private imagesService: ImagesService,
		@InjectRepository(Character)
		private characterRepo: Repository<Character>,
	) { }

	async getMainPageContent(): Promise<MainPageContentDto> {
		const [ newProfiles, newArtwork, newScreenshots ] = await Promise.all([
			this.getNewProfiles(),
			this.imagesService.getImages({ limit: this.MAX_NEW_IMAGES, category: ImageCategory.ARTWORK }),
			this.imagesService.getImages({ limit: this.MAX_NEW_IMAGES, category: ImageCategory.SCREENSHOT }),
		]);

		return {
			newProfiles,
			newArtwork,
			newScreenshots,
			newStories: [], // Will be loaded by StoriesService instead
			newNoticeboardItems: [], // Will be loaded by NoticeboardService instead
			news: [], // Will be loaded by NewsService instead
			newsUpToDate: false,
		};
	}

	private async getNewProfiles(): Promise<CharacterSummaryDto[]> {
		const newCharacters = await this.characterRepo.createQueryBuilder('character')
			.where('character.verifiedAt IS NOT NULL')
			.orderBy('character.verifiedAt', 'DESC')
			.innerJoinAndSelect('character.server', 'server')
			.limit(this.MAX_NEW_PROFILES)
			.select([ 'character.name', 'character.race', 'character.avatar', 'server.name' ])
			.getMany();

		return newCharacters.map(character => ({
			name: character.name,
			race: character.race,
			avatar: character.avatar,
			server: character.server.name,
		}));
	}
}
