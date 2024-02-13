import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';
import { NewsDto } from '@app/shared/dto/news/news.dto';
import { Controller, Get } from '@nestjs/common';
import { CommunitiesService } from '../communities/communities.service';
import { NewsService } from '../news/news.service';
import { NoticeboardService } from '../noticeboard/noticeboard.service';
import { StoriesService } from '../stories/stories.service';
import { VenuesService } from '../venues/venues.service';
import { MainPageService } from './main-page.service';
import { ClientRegion } from 'apps/chaosarchives/src/common/client-region.decorator';
import { SiteRegion } from '@app/shared/enums/region.enum';

@Controller('main-page')
export class MainPageController {
  private readonly MAX_STORIES = 10;

  private readonly MAX_NOTICEBOARD_ITEMS = 7;

  private readonly MAX_NEW_VENUES = 7;

  private readonly MAX_NEW_COMMUNITIES = 7;

  constructor(
    private readonly newsService: NewsService,
    private readonly mainPageService: MainPageService,
    private readonly storiesService: StoriesService,
    private readonly noticeboardService: NoticeboardService,
    private readonly venuesService: VenuesService,
    private readonly communitiesService: CommunitiesService,
  ) {}

  // Gets the content of the main page. News may be out of date.
  @Get('/')
  async getMainPageContent(@ClientRegion() region: SiteRegion): Promise<MainPageContentDto> {
    const [mainPageContent, newsResult, storyList, noticeboardItemList, newVenuesList, newCommunitiesList] =
      await Promise.all([
        this.mainPageService.getMainPageContent(region),
        this.newsService.getLatestSummaries(region),
        this.storiesService.getStoryList(region, { limit: this.MAX_STORIES }),
        this.noticeboardService.getNoticeboardItemList(region, { limit: this.MAX_NOTICEBOARD_ITEMS }),
        this.venuesService.getVenues(region, { limit: this.MAX_NEW_VENUES }, true),
        this.communitiesService.getCommunities(region, { limit: this.MAX_NEW_COMMUNITIES }, true),
      ]);

    mainPageContent.news = newsResult;
    mainPageContent.newsUpToDate = true;
    mainPageContent.newStories = storyList.data;
    mainPageContent.newNoticeboardItems = noticeboardItemList;
    mainPageContent.newVenues = newVenuesList.data;
    mainPageContent.newCommunities = newCommunitiesList;
    return mainPageContent;
  }

  // Gets relatively up to date news.
  @Get('/news')
  async getUpdatedNews(@ClientRegion() region: SiteRegion): Promise<NewsDto[]> {
    return this.newsService.getLatestSummaries(region);
  }
}
