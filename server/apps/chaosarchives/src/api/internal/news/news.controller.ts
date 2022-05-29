import { NewsArticleDto } from "@app/shared/dto/news/news-article.dto";
import { NewsIssueDto } from "@app/shared/dto/news/news-issue.dto";
import { NewsDto } from "@app/shared/dto/news/news.dto";
import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { NewsService } from "./news.service";

@Controller('news')
export class NewsController {
	constructor(private newsService: NewsService) { }

	@Get('latest')
	async getLatestIssue(): Promise<NewsIssueDto|null> {
		return this.newsService.getLatestIssue();
	}

	@Get('by-slug/:slug')
	async getArticleBySlug(@Param('slug') slug: string): Promise<NewsArticleDto> {
		return this.newsService.getArticleBySlug(slug);
	}

	@Get('issues')
	async getIssues(): Promise<number[]> {
		return this.newsService.getIssues();
	}

	@Get('issues/:id')
	async getIssueById(@Param('id', ParseIntPipe) id: number): Promise<NewsIssueDto> {
		return this.newsService.getIssueById(id);
	}
}
