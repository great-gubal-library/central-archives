import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';
import { NewsDto } from '@app/shared/dto/news/news.dto';
import APITransport from './api-transport';
import CharactersAPI from './characters-api';
import EventsAPI from './events-api';
import ImagesAPI from './images-api';
import StoriesAPI from './stories-api';
import UserAPI from './user-api';

export default class API {
  private readonly transport = new APITransport();

  public readonly prefix = this.transport.prefix;

  // Sub-APIs
  
  readonly user = new UserAPI(this.transport);
  readonly characters = new CharactersAPI(this.transport);
  readonly events = new EventsAPI(this.transport);
  readonly images = new ImagesAPI(this.transport);
  readonly stories = new StoriesAPI(this.transport);

  // Access token management

  hasAccessToken() {
    return this.transport.hasAccessToken();
  }

  setAccessToken(accessToken: string | null) {
    this.transport.setAccessToken(accessToken);
  }

  // Regular API calls

  async getMainPageContent(): Promise<MainPageContentDto> {
    return this.transport.get<MainPageContentDto>('main-page');
  }

  async getUpdatedNews(): Promise<NewsDto[]> {
    return this.transport.get<NewsDto[]>('main-page/news');
  }
}
