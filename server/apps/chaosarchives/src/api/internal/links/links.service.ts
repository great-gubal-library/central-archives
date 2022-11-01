import { Character, Community, Event, FreeCompany, Image, NoticeboardItem, Story, Venue, WikiPage } from '@app/entity';
import { LinkResultDto } from '@app/shared/dto/links/link-result.dto';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { PageType } from '@app/shared/enums/page-type.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';

@Injectable()
export class LinksService {
	constructor(
		@InjectRepository(Character) private characterRepo: Repository<Character>,
		@InjectRepository(FreeCompany) private freeCompanyRepo: Repository<FreeCompany>,
		@InjectRepository(Community) private communityRepo: Repository<Community>,
		@InjectRepository(Venue) private venueRepo: Repository<Venue>,
		@InjectRepository(Event) private eventRepo: Repository<Event>,
		@InjectRepository(Story) private storyRepo: Repository<Story>,
		@InjectRepository(NoticeboardItem) private noticeboardItemRepo: Repository<NoticeboardItem>,
		@InjectRepository(WikiPage) private wikiPageRepo: Repository<WikiPage>,
		@InjectRepository(Image) private imageRepo: Repository<Image>,
		private imageService: ImagesService,
	) {}

	async resolve(name: string): Promise<LinkResultDto[]> {
		const resultLists = await Promise.all([
			this.getCharacters(name),
			this.getFreeCompanies(name),
			this.getCommunities(name),
			this.getVenues(name),
			this.getEvents(name),
			this.getStories(name),
			this.getNoticeboardItems(name),
			this.getWikiPages(name),
			this.getImages(name),
		]);

		return resultLists.flat();
	}

	private async getCharacters(name: string): Promise<LinkResultDto[]> {
		return (await this.characterRepo.find({
			where: {
				name
			},
			relations: [ 'server' ],
			select: [ 'name', 'server' ]
		})).map(character => ({
			type: PageType.PROFILE,
			name: character.name,
			server: character.server.name
		}));
	}

	private async getFreeCompanies(name: string): Promise<LinkResultDto[]> {
		return (await this.freeCompanyRepo.find({
			where: {
				name
			},
			relations: [ 'server' ],
			select: [ 'name', 'server' ]
		})).map(fc => ({
			type: PageType.FREE_COMPANY,
			name: fc.name,
			server: fc.server.name
		}));
	}

	private async getCommunities(name: string): Promise<LinkResultDto[]> {
		return (await this.communityRepo.find({
			where: {
				name
			},
			select: [ 'name' ]
		})).map(community => ({
			type: PageType.COMMUNITY,
			name: community.name,
		}));
	}

	private async getVenues(name: string): Promise<LinkResultDto[]> {
		return (await this.venueRepo.find({
			where: {
				name
			},
			relations: [ 'server' ],
			select: [ 'name', 'server' ]
		})).map(venue => ({
			type: PageType.VENUE,
			name: venue.name,
			server: venue.server.name
		}));
	}

	private async getEvents(name: string): Promise<LinkResultDto[]> {
		return (await this.eventRepo.find({
			where: {
				title: name
			},
			select: [ 'id' ]
		})).map(event => ({
			type: PageType.EVENT,
			id: event.id,
		}));
	}

	private async getStories(name: string): Promise<LinkResultDto[]> {
		return (await this.storyRepo.find({
			where: {
				title: name
			},
			select: [ 'id' ]
		})).map(story => ({
			type: PageType.STORY,
			id: story.id,
		}));
	}

	private async getNoticeboardItems(name: string): Promise<LinkResultDto[]> {
		return (await this.noticeboardItemRepo.find({
			where: {
				title: name
			},
			select: [ 'id' ]
		})).map(noticeboardItem => ({
			type: PageType.NOTICEBOARD_ITEM,
			id: noticeboardItem.id,
		}));
	}

	private async getWikiPages(name: string): Promise<LinkResultDto[]> {
		return (await this.wikiPageRepo.find({
			where: {
				title: name
			},
			select: [ 'id', 'title' ]
		})).map(wikiPage => ({
			type: PageType.WIKI_PAGE,
			id: wikiPage.id,
			name: wikiPage.title,
		}));
	}

	private async getImages(name: string): Promise<LinkResultDto[]> {
		return (await this.imageRepo.find({
			where: {
				title: name,
				category: In([ImageCategory.ARTWORK, ImageCategory.SCREENSHOT]),
			},
			relations: [ 'owner', 'owner.server' ],
		})).map(image => ({
			type: PageType.IMAGE,
			id: image.id,
			image: this.imageService.toImageSummaryDto(image),
		}));
	}
}
