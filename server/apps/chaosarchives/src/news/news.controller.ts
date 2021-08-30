import { Controller, Get } from '@nestjs/common';
import { NewsEntry } from '@app/shared/dto/news/NewsEntry';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
	constructor(private readonly newsService: NewsService) {}

	@Get('/')
	async getNews(): Promise<NewsEntry[]> {
		return this.newsService.getNews();
	}
}
