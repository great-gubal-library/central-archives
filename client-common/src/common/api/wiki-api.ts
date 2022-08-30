import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { WikiPageDto } from '@app/shared/dto/wiki/wiki-page.dto';
import APITransport from './api-transport';

export default class WikiAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('wiki');
  }

  async getWikiPageById(id: number): Promise<WikiPageDto> {
    return this.transport.tokenGet<WikiPageDto>(`${id}`);
  }

  async getWikiPageByTitle(title: string): Promise<WikiPageDto> {
    return this.transport.tokenGet<WikiPageDto>(`by-title/${title}`);
  }

  async createNoticeboardItem(wikiPage: WikiPageDto): Promise<IdWrapper> {
    return this.transport.authPost<IdWrapper>('', wikiPage);
  }

  async editWikiPage(wikiPage: WikiPageDto): Promise<void> {
    return this.transport.authPut<void>(`${wikiPage.id || -1}`, wikiPage);
  }

  async deleteWikiPage(id: number): Promise<void> {
    return this.transport.authDelete<void>(`${id}`);
  }
}
