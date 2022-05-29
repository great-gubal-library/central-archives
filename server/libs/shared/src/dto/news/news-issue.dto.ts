import { NewsArticleDto } from "./news-article.dto";

export interface NewsIssueDto {
	id: number;
	publishedAt: number;
	articles: NewsArticleDto[];
}
