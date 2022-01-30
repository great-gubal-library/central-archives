import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';
import { NewsDto } from '@app/shared/dto/news/news.dto';
import { Controller, Get } from '@nestjs/common';
import { NoticeboardService } from '../noticeboard/noticeboard.service';
import { StoriesService } from '../stories/stories.service';
import { VenuesService } from '../venues/venues.service';
import { MainPageService } from './main-page.service';
import { NewsCacheType, NewsService } from './news.service';

@Controller('main-page')
export class MainPageController {
  private readonly MAX_STORIES = 10;

  private readonly MAX_NOTICEBOARD_ITEMS = 7;

	private readonly MAX_NEW_VENUES = 7;

  constructor(
    private readonly newsService: NewsService,
    private readonly mainPageService: MainPageService,
    private readonly storiesService: StoriesService,
    private readonly noticeboardService: NoticeboardService,
    private readonly venuesService: VenuesService,
  ) {}

  // Gets the content of the main page. News may be out of date.
  @Get('/')
  async getMainPageContent(): Promise<MainPageContentDto> {
    const [mainPageContent, newsResult, storyList, noticeboardItemList, newVenuesList] = await Promise.all([
			this.mainPageService.getMainPageContent(),
			this.newsService.getNews(),
      this.storiesService.getStoryList({ limit: this.MAX_STORIES }),
      this.noticeboardService.getNoticeboardItemList({ limit: this.MAX_NOTICEBOARD_ITEMS }),
      this.venuesService.getVenues({ limit: this.MAX_NEW_VENUES }),
		]);
		
		mainPageContent.news = newsResult.news;
    mainPageContent.newsUpToDate = newsResult.newsUpToDate;
    mainPageContent.newStories = storyList.data;
    mainPageContent.newNoticeboardItems = noticeboardItemList;
    mainPageContent.newVenues = newVenuesList;
		return mainPageContent;
  }

  // Gets relatively up to date news.
  @Get('/news')
  async getUpdatedNews(): Promise<NewsDto[]> {
    return (await this.newsService.getNews(NewsCacheType.SHORT)).news;
  }
}
