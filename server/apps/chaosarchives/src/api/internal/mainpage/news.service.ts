import SharedConstants from '@app/shared/SharedConstants';
import { NewsDto } from '@app/shared/dto/news/news.dto';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { DateTime, Duration } from 'luxon';
import utils from '../../../common/utils';
import { DailyMoogleService } from './daily-moogle.service';
import { LimsaInsiderService } from './limsa-insider.service';

export enum NewsCacheType {
	LONG, SHORT
}

@Injectable()
export class NewsService {
	private readonly CACHE_DURATION_LONG_SEC = 86400;

	private readonly CACHE_DURATION_SHORT_MS = Duration.fromObject({ minutes: 5 }).toMillis();

	constructor(
		@InjectRedis()
		private readonly redisService: Redis,
		private dailyMoogleService: DailyMoogleService,
		private limsaInsiderService: LimsaInsiderService,
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
		void this.redisService.set('news', JSON.stringify(news), 'EX', this.CACHE_DURATION_LONG_SEC);
		void this.redisService.set('newsTimestamp', Date.now().toString(), 'EX', this.CACHE_DURATION_LONG_SEC);
		return { news, newsUpToDate: true };
	}

	private async fetchNews(): Promise<NewsDto[]> {
		return (await this.limsaInsiderService.fetchNews())
			.sort((n1, n2) => -utils.compareNumbers(n1.date, n2.date)) // sort by date descending
			.slice(0, SharedConstants.MAX_NEWS_ENTRIES);
	}
}
