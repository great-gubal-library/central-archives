import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { HttpService, Injectable } from '@nestjs/common';
import parse from 'node-html-parser';
import { JSDOM } from 'jsdom';
import { NewsDto } from '@app/shared/dto/news/news.dto';

@Injectable()
export class NewsService {
	private readonly NEWS_SITE = 'https://crescentmoonpublishing.com/feed/';

	private readonly CACHE_DURATION_SEC = 5 * 60;

	constructor(
		@InjectRedis()
		private readonly redisService: Redis,
		private httpService: HttpService,
	) { }

	async getNews(): Promise<NewsDto[]> {
		const cachedNews = await this.redisService.get('news');

		if (cachedNews) {
			return JSON.parse(cachedNews);
		}

		// Not cached - fetch and cache
		const news = await this.fetchNews();
		this.redisService.set('news', JSON.stringify(news), 'ex', this.CACHE_DURATION_SEC); // Intentionally no await
		return news;
	}

	private async fetchNews(): Promise<NewsDto[]> {
		// Parse RSS feed
		const page = await this.httpService.get<string>(this.NEWS_SITE).toPromise();
		const doc = new JSDOM(page.data, { contentType: 'application/rss+xml' }).window.document;
		const newsItems = Array.from(doc.querySelectorAll('item'));
		
		// Take top 3 news entries
		const result = await Promise.all(newsItems.slice(0, 3).map(async item => {
			const content = item.querySelector('description')!.textContent!; // Guaranteed to exist
			const contentHtml = parse(content);
			const contentParagraph = contentHtml.querySelector('p');

			try {
				// Get image URL from linked page
				const link = item.querySelector('link')!.textContent!; // Guaranteed to exist
				const linkedPage = await this.httpService.get<string>(link).toPromise();
				const linkedDoc = parse(linkedPage.data);
				const image = linkedDoc.querySelector('.attachment-medium_large');

				return {
					title: item.querySelector('title')!.textContent!, // Guaranteed to exist
					author: item.getElementsByTagName('dc:creator')[0].textContent!, // Guaranteed to exist
					content: contentParagraph ? contentParagraph.textContent : '',
					image: image ? image.getAttribute('data-src') : '',
					link,
				};
			} catch (e) {
				return null;
			}
		}));

		return result.filter(item => item !== null) as NewsDto[];
	}
}
