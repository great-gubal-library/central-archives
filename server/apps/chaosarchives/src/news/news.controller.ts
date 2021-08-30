import { Controller, Get } from '@nestjs/common';
import { NewsDto } from '@app/shared/dto/news/news.dto';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
	constructor(private readonly newsService: NewsService) {}

	@Get('/')
	async getNews(): Promise<NewsDto[]> {
		return this.newsService.getNews();
	}
}
