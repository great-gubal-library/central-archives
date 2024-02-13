import { Character } from '@app/entity';
import { FreeCompany } from '@app/entity/free-company.entity';
import { CharacterSummaryDto } from '@app/shared/dto/characters/character-summary.dto';
import { FreeCompanySummaryDto } from '@app/shared/dto/fcs/free-company-summary.dto';
import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';
import { SiteRegion } from '@app/shared/enums/region.enum';

@Injectable()
export class MainPageService {
	private readonly MAX_NEW_PROFILES = 7;

	private readonly MAX_NEW_FCS = 7;

	private readonly MAX_NEW_IMAGES = 8;

	constructor(
		private imagesService: ImagesService,
		@InjectRepository(Character) private characterRepo: Repository<Character>,
		@InjectRepository(FreeCompany) private freeCompanyRepo: Repository<FreeCompany>,
	) { }

	async getMainPageContent(region: SiteRegion): Promise<MainPageContentDto> {
		const [ newProfiles, newFreeCompanies, newArtwork, newScreenshots ] = await Promise.all([
			this.getNewProfiles(),
			this.getNewFreeCompanies(),
			this.imagesService.getImages(region, { limit: this.MAX_NEW_IMAGES, category: ImageCategory.ARTWORK }),
			this.imagesService.getImages(region, { limit: this.MAX_NEW_IMAGES, category: ImageCategory.SCREENSHOT }),
		]);

		return {
			newProfiles,
			newFreeCompanies,
			newArtwork: newArtwork.data,
			newScreenshots: newScreenshots.data,
			newStories: [], // Will be loaded by StoriesService instead
			newNoticeboardItems: [], // Will be loaded by NoticeboardService instead
			newCommunities: [], // Will be loaded by CommunitiesService instead
			newVenues: [], // Will be loaded by VenueService instead
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
			.select([ 'character.name', 'character.race', 'character.avatar', 'character.occupation', 'server.name' ])
			.getMany();

		return newCharacters.map(character => ({
			name: character.name,
			race: character.race,
			avatar: character.avatar,
			occupation: character.occupation,
			server: character.server.name,
		}));
	}

	private async getNewFreeCompanies(): Promise<FreeCompanySummaryDto[]> {
		const newFCs = await this.freeCompanyRepo.createQueryBuilder('fc')
			.where('fc.claimedAt IS NOT NULL')
			.orderBy('fc.claimedAt', 'DESC')
			.innerJoinAndSelect('fc.server', 'server')
			.limit(this.MAX_NEW_FCS)
			.select([ 'fc.id', 'fc.name', 'fc.crest', 'fc.goal', 'server.name' ])
			.getMany();

		return newFCs.map(fc => ({
			name: fc.name,
			crest: fc.getCrest(),
			goal: fc.goal,
			server: fc.server.name,
		}));
	}
}
