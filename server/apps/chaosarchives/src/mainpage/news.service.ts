import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { HttpService, Injectable } from '@nestjs/common';
import parse from 'node-html-parser';
import { JSDOM } from 'jsdom';
import { NewsDto } from '@app/shared/dto/news/news.dto';
import { DateTime, Duration } from 'luxon';

export enum NewsCacheType {
	LONG, SHORT
}

@Injectable()
export class NewsService {
	private readonly NEWS_SITE = 'https://crescentmoonpublishing.com/feed/';

	private readonly CACHE_DURATION_LONG_SEC = 86400;

	private readonly CACHE_DURATION_SHORT_MS = Duration.fromObject({ minutes: 5 }).toMillis();

	constructor(
		@InjectRedis()
		private readonly redisService: Redis,
		private httpService: HttpService,
	) { }

	async getNews(cacheType: NewsCacheType = NewsCacheType.LONG): Promise<{ news: NewsDto[], newsUpToDate: boolean }> {
		const [ cachedNews, newsTimestamp ] = await Promise.all([
			this.redisService.get('news'),
			this.redisService.get('newsTimestamp'),
		]);

		if (cachedNews) {
			let newsUpToDate = false;

			if (newsTimestamp) {
				const date = DateTime.fromMillis(parseInt(newsTimestamp, 10));
				if (DateTime.now().diff(date).toMillis() <= this.CACHE_DURATION_SHORT_MS) {
					// Still up to date
					newsUpToDate = true;
				}
			}
			
			if (cacheType === NewsCacheType.LONG || newsUpToDate) {
				// On initial load, even old news is better than nothing
				return { news: JSON.parse(cachedNews), newsUpToDate };
			}
		}

		// Not cached, or cache is obsolete - fetch and cache
		const news = await this.fetchNews();
		this.redisService.set('news', JSON.stringify(news), 'ex', this.CACHE_DURATION_LONG_SEC); // Intentionally no await
		this.redisService.set('newsTimestamp', Date.now().toString(), 'ex', this.CACHE_DURATION_LONG_SEC);
		return { news, newsUpToDate: true };
	}

	private async fetchNews(): Promise<NewsDto[]> {
		// Parse RSS feed
		const page = await this.httpService.get<string>(this.NEWS_SITE).toPromise();
		const doc = new JSDOM(page.data, { contentType: 'application/rss+xml' }).window.document;
		const newsItems = Array.from(doc.querySelectorAll('item'))
				.filter(item => !this.isOOC(item.querySelector('title')!.textContent!));
		
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
				let images = linkedDoc.querySelectorAll('.elementor-section:nth-child(3) .elementor-col-50:first-child img');

				if (images.length === 0) {
					images = linkedDoc.querySelectorAll('.elementor-col-50:first-child .elementor-widget-image img');
				}

				return {
					title,
					author,
					content,
					link,
					image: images.length > 0 ? images[0].getAttribute('data-src')! : '',
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

	private isOOC(title: string) {
		return title.includes('OOC')
			|| title.includes('(ooc)')
			|| title.includes('Final Fantasy')
			|| title.includes('XIV');
	}
}
