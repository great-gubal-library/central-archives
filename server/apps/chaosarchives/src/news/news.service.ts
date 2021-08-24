import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { HttpService, Injectable } from '@nestjs/common';
import parse from 'node-html-parser';
import { NewsEntry } from './dto/NewsEntry';

@Injectable()
export class NewsService {
	private readonly NEWS_SITE = 'https://crescentmoonpublishing.com/the-daily-moogle/';

	constructor(
    @InjectRedis()
    private readonly redisService: Redis,
		private httpService: HttpService,
	) {}

	async getNews(): Promise<NewsEntry[]> {
		const response = await this.httpService.get<string>(this.NEWS_SITE).toPromise();
		const doc = parse(response.data);
		const newsElement = doc.querySelector('.grid-col-desk-2');
		const newsItems = newsElement.querySelectorAll('.jet-listing-grid__item');

		const imageRegex = /background-image:url\("(http[^"]*)"\)/;
		
		return newsItems.slice(0, 3).map(item => {
			const style = item.querySelector("style").textContent;
			const imageMatch = style.match(imageRegex);
			const titleLink = item.querySelector('.elementor-heading-title a');
			const authorLink = item.querySelector('.jet-listing-dynamic-field__content a');
			const content = item.querySelector('.elementor-text-editor');

			return {
				title: titleLink.textContent || '',
				author: authorLink ? authorLink.textContent : '',
				content: content ? content.textContent.trim() : '',
				image: imageMatch ? imageMatch[1] : '',
				link: titleLink.getAttribute('href') || '',
			};
		});
	}
}
