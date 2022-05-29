import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';
import { NewsDto } from '@app/shared/dto/news/news.dto';
import APITransport from './api-transport';
import CharactersAPI from './characters-api';
import CommunitiesAPI from './communities-api';
import EventsAPI from './events-api';
import FreeCompaniesAPI from './free-companies-api';
import ImagesAPI from './images-api';
import LinksAPI from './links-api';
import NewsAPI from './news-api';
import NoticeboardAPI from './noticeboard-api';
import SearchAPI from './search-api';
import StoriesAPI from './stories-api';
import UserAPI from './user-api';
import VenuesAPI from './venues-api';
import ViolationsAPI from './violations-api';

export default class API {
  private readonly transport = new APITransport();

  public readonly prefix = this.transport.prefix;

  // Sub-APIs
  
  readonly user = new UserAPI(this.transport);
  readonly characters = new CharactersAPI(this.transport);
  readonly communities = new CommunitiesAPI(this.transport);
  readonly events = new EventsAPI(this.transport);
  readonly freeCompanies = new FreeCompaniesAPI(this.transport);
  readonly images = new ImagesAPI(this.transport);
  readonly links = new LinksAPI(this.transport);
  readonly news = new NewsAPI(this.transport);
  readonly noticeboard = new NoticeboardAPI(this.transport);
  readonly search = new SearchAPI(this.transport);
  readonly stories = new StoriesAPI(this.transport);
  readonly venues = new VenuesAPI(this.transport);
  readonly violations = new ViolationsAPI(this.transport);

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
