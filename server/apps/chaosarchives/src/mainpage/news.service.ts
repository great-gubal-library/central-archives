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
		
		return Promise.all(newsItems.slice(0, 3).map(async item => {
			const title = item.querySelector('title')!.textContent!; // Guaranteed to exist
			const author = item.getElementsByTagName('dc:creator')[0].textContent!; // Guaranteed to exist
			const link = item.querySelector('link')!.textContent!; // Guaranteed to exist

			const description = item.querySelector('description')!.textContent!; // Guaranteed to exist
			const contentHtml = parse(description);
			const contentParagraph = contentHtml.querySelector('p');
			const content = contentParagraph ? contentParagraph.textContent! : '';

			try {
				// Get image URL from linked page
				const linkedPage = await this.httpService.get<string>(link).toPromise();
				const linkedDoc = parse(linkedPage.data);
				const image = linkedDoc.querySelector('.attachment-medium_large');

				return {
					title,
					author,
					content,
					link,
					image: image ? image.getAttribute('data-src')! : '',
				};
			} catch (e) {
				// Fallback in case we can't get the image URL
				return {
					title,
					author,
					content,
					link,
					image: ''
				};
			}
		}));
	}
}
