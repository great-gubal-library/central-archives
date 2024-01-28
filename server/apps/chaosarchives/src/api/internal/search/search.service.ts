import { Character, Community, Event, FreeCompany, Image, NoticeboardItem, Story, Venue, WikiPage } from '@app/entity';
import { SearchFields } from '@app/entity/search-fields';
import { SearchResultDto } from '@app/shared/dto/search/search-result.dto';
import { SearchResultsDto } from '@app/shared/dto/search/search-results.dto';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { PageType } from '@app/shared/enums/page-type.enum';
import { escapeStringRegexp, toSearchKeywords } from '@app/shared/search-utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import sanitizeHtml from 'sanitize-html';
import { Repository } from 'typeorm';
import { andWhereMatches } from '../../../common/db';
import { ImagesService } from '../images/images.service';

@Injectable()
export class SearchService {
  private readonly MAX_RESULTS = 20;

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

  async search(query: string): Promise<SearchResultsDto[]> {
    const keywords = toSearchKeywords(query);

    if (keywords.length === 0) {
      return [];
    }

    const [profiles, freeCompanies, communities, venues, events, stories, noticeboardItems, wikiPages, images] =
      await Promise.all([
        this.searchCharacters(keywords),
        this.searchFreeCompanies(keywords),
        this.searchCommunities(keywords),
        this.searchVenues(keywords),
        this.searchEvents(keywords),
        this.searchStories(keywords),
        this.searchNoticeboardItems(keywords),
        this.searchWikiPages(keywords),
        this.searchImages(keywords),
      ]);

    return [
      { type: PageType.PROFILE, results: this.filter(profiles) },
      { type: PageType.FREE_COMPANY, results: this.filter(freeCompanies) },
      { type: PageType.COMMUNITY, results: this.filter(communities) },
      { type: PageType.VENUE, results: this.filter(venues) },
      { type: PageType.EVENT, results: this.filter(events) },
      { type: PageType.STORY, results: this.filter(stories) },
      { type: PageType.NOTICEBOARD_ITEM, results: this.filter(noticeboardItems) },
      { type: PageType.WIKI_PAGE, results: this.filter(wikiPages) },
      { type: PageType.IMAGE, results: this.filter(images) },
    ];
  }

  private async searchCharacters(keywords: string[]): Promise<SearchResultDto[]> {
    const properties = SearchFields.character;
    const qb = this.characterRepo.createQueryBuilder('c');

    return (
      await andWhereMatches(qb, 'c', properties, keywords)
        .innerJoinAndSelect('c.server', 'server')
        .select([...this.expandProperties('c', properties), 'server.name', 'c.updatedAt'])
        .orderBy('c.updatedAt', 'DESC')
        .limit(this.MAX_RESULTS)
        .getMany()
    ).map((character) => ({
      name: character.name,
      server: character.server.name,
      content: this.getContent(character, properties, keywords),
      updatedAt: character.updatedAt.getTime(),
    }));
  }

  private async searchFreeCompanies(keywords: string[]): Promise<SearchResultDto[]> {
    const properties = SearchFields.freeCompany;
    const qb = this.freeCompanyRepo.createQueryBuilder('fc');

    return (
      await andWhereMatches(qb, 'fc', properties, keywords)
        .innerJoinAndSelect('fc.server', 'server')
        .select([...this.expandProperties('fc', properties), 'server.name', 'fc.updatedAt'])
        .orderBy('fc.updatedAt', 'DESC')
        .limit(this.MAX_RESULTS)
        .getMany()
    ).map((fc) => ({
      name: fc.name,
      server: fc.server.name,
      content: this.getContent(fc, properties, keywords),
      updatedAt: fc.updatedAt.getTime(),
    }));
  }

  private async searchCommunities(keywords: string[]): Promise<SearchResultDto[]> {
    const properties = SearchFields.community;
    const qb = this.communityRepo.createQueryBuilder('c');

    return (
      await andWhereMatches(qb, 'c', properties, keywords)
        .select([...this.expandProperties('c', properties), 'c.updatedAt'])
        .orderBy('c.updatedAt', 'DESC')
        .limit(this.MAX_RESULTS)
        .getMany()
    ).map((community) => ({
      name: community.name,
      content: this.getContent(community, properties, keywords),
      updatedAt: community.updatedAt.getTime(),
    }));
  }

  private async searchVenues(keywords: string[]): Promise<SearchResultDto[]> {
    const properties = SearchFields.venue;
    const qb = this.venueRepo.createQueryBuilder('v');

    return (
      await andWhereMatches(qb, 'v', properties, keywords)
        .innerJoinAndSelect('v.server', 'server')
        .select([...this.expandProperties('v', properties), 'server.name', 'v.updatedAt'])
        .orderBy('v.updatedAt', 'DESC')
        .limit(this.MAX_RESULTS)
        .getMany()
    ).map((venue) => ({
      name: venue.name,
      server: venue.server.name,
      content: this.getContent(venue, properties, keywords),
      updatedAt: venue.updatedAt.getTime(),
    }));
  }

  private async searchEvents(keywords: string[]): Promise<SearchResultDto[]> {
    const properties = SearchFields.event;
    const qb = this.eventRepo.createQueryBuilder('e');

    return (
      await andWhereMatches(qb, 'e', properties, keywords)
        .select(['e.id', ...this.expandProperties('e', properties), 'e.updatedAt', 'e.startDateTime', 'e.endDateTime' ])
        .orderBy('e.startDateTime', 'DESC')
        .limit(this.MAX_RESULTS)
        .getMany()
    ).map((event) => ({
      id: event.id,
      name: event.title,
      content: this.getContent(event, properties, keywords),
      updatedAt: event.updatedAt.getTime(),
      startDateTime: event.startDateTime.getTime(),
      endDateTime: event.endDateTime?.getTime(),
    }));
  }

  private async searchStories(keywords: string[]): Promise<SearchResultDto[]> {
    const properties = SearchFields.story;
    const qb = this.storyRepo.createQueryBuilder('s');

    return (
      await andWhereMatches(qb, 's', properties, keywords)
        .select(['s.id', ...this.expandProperties('s', properties), 's.updatedAt'])
        .orderBy('s.updatedAt', 'DESC')
        .limit(this.MAX_RESULTS)
        .getMany()
    ).map((story) => ({
      id: story.id,
      name: story.title,
      content: this.getContent(story, properties, keywords),
      updatedAt: story.updatedAt.getTime(),
    }));
  }

  private async searchNoticeboardItems(keywords: string[]): Promise<SearchResultDto[]> {
    const properties = SearchFields.noticeboardItem;
    const qb = this.noticeboardItemRepo.createQueryBuilder('nb');

    return (
      await andWhereMatches(qb, 'nb', properties, keywords)
        .select(['nb.id', ...this.expandProperties('nb', properties), 'nb.updatedAt'])
        .orderBy('nb.updatedAt', 'DESC')
        .limit(this.MAX_RESULTS)
        .getMany()
    ).map((noticeboardItem) => ({
      id: noticeboardItem.id,
      name: noticeboardItem.title,
      content: this.getContent(noticeboardItem, properties, keywords),
      updatedAt: noticeboardItem.updatedAt.getTime(),
    }));
  }

  private async searchWikiPages(keywords: string[]): Promise<SearchResultDto[]> {
    const properties = SearchFields.wikiPage;
    const qb = this.wikiPageRepo.createQueryBuilder('wp');

    return (
      await andWhereMatches(qb, 'wp', properties, keywords)
        .select(['wp.id', ...this.expandProperties('wp', properties), 'wp.updatedAt'])
        .orderBy('wp.updatedAt', 'DESC')
        .limit(this.MAX_RESULTS)
        .getMany()
    ).map((wikiPage) => ({
      id: wikiPage.id,
      name: wikiPage.title,
      content: this.getContent(wikiPage, properties, keywords),
      updatedAt: wikiPage.updatedAt.getTime(),
    }));
  }

  private async searchImages(keywords: string[]): Promise<SearchResultDto[]> {
    const properties = SearchFields.image;
    const qb = this.imageRepo.createQueryBuilder('i');

    return (
      await andWhereMatches(qb, 'i', properties, keywords)
        .andWhere('i.category IN (:...categories)', { categories: [ImageCategory.ARTWORK, ImageCategory.SCREENSHOT] })
        .innerJoinAndSelect('i.owner', 'owner')
        .innerJoinAndSelect('owner.server', 'server')
        .select(['i', 'owner.id', 'owner.name', 'server.name'])
        .orderBy('i.updatedAt', 'DESC')
        .limit(this.MAX_RESULTS)
        .getMany()
    ).map((image) => ({
      id: image.id,
      name: image.title,
      content: this.getContent(image, properties, keywords),
      image: this.imageService.toImageSummaryDto(image),
      updatedAt: image.updatedAt.getTime(),
    }));
  }

  private expandProperties(alias: string, properties: string[]) {
    return properties.map((property) => `${alias}.${property}`);
  }

  private getContent(obj: unknown, properties: string[], keywords: string[]): string {
    const objByProperties = obj as { [k: string]: string };
    const keywordsRegexps = keywords.map((keyword) => {
      const escapedKeyword = escapeStringRegexp(keyword);
      return new RegExp(
        `^(${escapedKeyword})$|^(${escapedKeyword})[^\\w]|[^\\w](${escapedKeyword})$|[^\\w](${escapedKeyword})[^\\w]`,
      );
    });

    for (const property of properties) {
      // Strip all HTML
      const value = sanitizeHtml(objByProperties[property], { allowedTags: [] });
      const valueLower = value.toLowerCase();

      // Require the content to contain every keyword
      if (keywordsRegexps.every((keyword) => keyword.test(valueLower))) {
        return value;
      }
    }

    return '';
  }

  private filter(results: SearchResultDto[]): SearchResultDto[] {
    return results.filter((result) => result.content !== '');
  }
}
