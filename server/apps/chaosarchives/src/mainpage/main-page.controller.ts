import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';
import { NewsDto } from '@app/shared/dto/news/news.dto';
import { Controller, Get } from '@nestjs/common';
import { StoriesService } from '../stories/stories.service';
import { MainPageService } from './main-page.service';
import { NewsCacheType, NewsService } from './news.service';

@Controller('main-page')
export class MainPageController {
  private readonly MAX_STORIES = 10;

  constructor(
    private readonly newsService: NewsService,
    private readonly mainPageService: MainPageService,
    private readonly storiesService: StoriesService,
  ) {}

  // Gets the content of the main page. News may be out of date.
  @Get('/')
  async getMainPageContent(): Promise<MainPageContentDto> {
    const [mainPageContent, newsResult, storyList] = await Promise.all([
			this.mainPageService.getMainPageContent(),
			this.newsService.getNews(),
      this.storiesService.getStoryList({ limit: this.MAX_STORIES }),
		]);
		
		mainPageContent.news = newsResult.news;
    mainPageContent.newsUpToDate = newsResult.newsUpToDate;
    mainPageContent.newStories = storyList;
		return mainPageContent;
  }

  // Gets relatively up to date news.
  @Get('/news')
  async getUpdatedNews(): Promise<NewsDto[]> {
    return (await this.newsService.getNews(NewsCacheType.SHORT)).news;
  }
}
