import { Character, Community, Event, FreeCompany, Image, NoticeboardItem, Story, Venue } from '@app/entity';
import { SearchFields } from '@app/entity/search-fields';
import { SearchResultDto } from '@app/shared/dto/search/search-result.dto';
import { SearchResultsDto } from '@app/shared/dto/search/search-results.dto';
import { PageType } from '@app/shared/enums/page-type.enum';
import { escapeStringRegexp, toSearchKeywords } from '@app/shared/search-utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import sanitizeHtml from 'sanitize-html';
import { Repository } from 'typeorm';
import { andWhereMatches } from '../common/db';
import { ImagesService } from '../images/images.service';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Character) private characterRepo: Repository<Character>,
    @InjectRepository(FreeCompany) private freeCompanyRepo: Repository<FreeCompany>,
    @InjectRepository(Community) private communityRepo: Repository<Community>,
    @InjectRepository(Venue) private venueRepo: Repository<Venue>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Story) private storyRepo: Repository<Story>,
    @InjectRepository(NoticeboardItem) private noticeboardItemRepo: Repository<NoticeboardItem>,
    @InjectRepository(Image) private imageRepo: Repository<Image>,
    private imageService: ImagesService,
  ) {}

  async search(query: string): Promise<SearchResultsDto[]> {
    const keywords = toSearchKeywords(query);

    if (keywords.length === 0) {
      return [];
    }

    return [{ type: PageType.PROFILE, results: this.filter(await this.searchCharacters(keywords)) }];
  }

  private async searchCharacters(keywords: string[]): Promise<SearchResultDto[]> {
    const properties = SearchFields.character;
    const qb = this.characterRepo.createQueryBuilder('c');

    return (
      await andWhereMatches(qb, 'c', properties, keywords)
        .innerJoinAndSelect('c.server', 'server')
        .select([...this.expandProperties('c', properties), 'server.name'])
        .getMany()
    ).map((character) => ({
      name: character.name,
      server: character.server.name,
      content: this.getContent(character, properties, keywords),
    }));
  }

  private expandProperties(alias: string, properties: string[]) {
    return properties.map((property) => `${alias}.${property}`);
  }

  private getContent(obj: unknown, properties: string[], keywords: string[]): string {
    const objByProperties = obj as { [k: string]: string };
    const keywordsRegexps = keywords
      .map((keyword) => {
        const escapedKeyword = escapeStringRegexp(keyword);
        return new RegExp(`^(${escapedKeyword})$|^(${escapedKeyword})[^\\w]|[^\\w](${escapedKeyword})$|[^\\w](${escapedKeyword})[^\\w]`);
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
    return results.filter(result => result.content !== '');
  }
}
