import { NewsIssueDto } from "@app/shared/dto/news/news-issue.dto";
import { Controller, Get } from "@nestjs/common";
import { NewsService } from "./news.service";

@Controller('news')
export class NewsController {
	constructor(private newsService: NewsService) { }

	@Get('latest')
	async getLatestIssue(): Promise<NewsIssueDto|null> {
		return this.newsService.getLatestIssue();
	}
}
