export interface NewsArticleDto {
	id: number;
	title: string;
	slug: string;
	content: string;
	publishedAt: string;
	category: string;
	author: {
		name: string;
		server: string;
		pseudonym: string;
	}
}
