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

	async getArticleBySlug(slug: string): Promise<NewsArticleDto> {
		return this.transport.get(`by-slug/${slug}`);
	}
}
