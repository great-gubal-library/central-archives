import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';
import { Controller, Get } from '@nestjs/common';
import { MainPageService } from './main-page.service';
import { NewsService } from './news.service';

@Controller('main-page')
export class MainPageController {
  constructor(
    private readonly newsService: NewsService,
    private readonly mainPageService: MainPageService,
  ) {}

  @Get('/')
  async getMainPageContent(): Promise<MainPageContentDto> {
    const [mainPageContent, news] = await Promise.all([
			this.mainPageService.getMainPageContent(),
			this.newsService.getNews(),
		]);
		
		mainPageContent.news = news;
		return mainPageContent;
  }
}
