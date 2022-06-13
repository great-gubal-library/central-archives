import { CurrentUser } from "@app/auth/decorators/current-user.decorator";
import { RoleRequired } from "@app/auth/decorators/role-required.decorator";
import { UserInfo } from "@app/auth/model/user-info";
import { NewsArticleDto } from "@app/shared/dto/news/news-article.dto";
import { NewsIssueDto } from "@app/shared/dto/news/news-issue.dto";
import { Role } from "@app/shared/enums/role.enum";
import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
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

	@Get('my-articles')
	@RoleRequired(Role.USER)
	async getMyArticles(@CurrentUser() user: UserInfo, @Query('characterId', ParseIntPipe) characterId: number): Promise<NewsArticleDto[]> {
		return this.newsService.getMyArticles(user, characterId);
	}
}
