export interface NewsArticleDto {
	id: number;
	title: string;
	subtitle: string;
	slug: string;
	content: string;
	publishedAt: number;
	category: string;
	author: {
		name: string;
		server: string;
		pseudonym: string;
	}
}
