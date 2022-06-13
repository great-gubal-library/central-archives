import { NewsArticleDto } from '@app/shared/dto/news/news-article.dto';
import { NewsIssueDto } from '@app/shared/dto/news/news-issue.dto';
import APITransport from './api-transport';

export default class NewsAPI {
	private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('news');
  }

	async getLatestIssue(): Promise<NewsIssueDto|null> {
		return this.transport.get('latest');
	}

	async getIssues(): Promise<number[]> {
		return this.transport.get('issues');
	}

	async getIssueById(id: number): Promise<NewsIssueDto> {
		return this.transport.get(`issues/${id}`);
	}

	async getArticleBySlug(slug: string): Promise<NewsArticleDto> {
		return this.transport.get(`by-slug/${slug}`);
	}

	async getArticleById(id: number): Promise<NewsArticleDto> {
		return this.transport.tokenGet(`articles/${id}`);
	}

	async getMyArticles(characterId: number): Promise<NewsArticleDto[]> {
		return this.transport.authGet('my-articles', { characterId });
	}

	async createArticle(article: NewsArticleDto): Promise<NewsArticleDto> {
		return this.transport.authPost('articles', article);
	}

	async editArticle(article: NewsArticleDto): Promise<NewsArticleDto> {
		return this.transport.authPut(`articles/${article.id}`, article);
	}
}
