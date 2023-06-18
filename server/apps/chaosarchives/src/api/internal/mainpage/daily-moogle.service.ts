import { NewsDto } from '@app/shared/dto/news/news.dto';
import SharedConstants from '@app/shared/SharedConstants';
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { JSDOM } from 'jsdom';
import { DateTime } from 'luxon';
import parse from 'node-html-parser';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DailyMoogleService {
	private readonly log = new Logger(DailyMoogleService.name);

	private readonly NEWS_SITE = 'https://crescentmoonpublishing.com/feed/';
	
	constructor(
		private httpService: HttpService,
	) { }

	async fetchNews(): Promise<NewsDto[]> {
		// Parse RSS feed
		let doc: Document;

		try {
			const page = await firstValueFrom(this.httpService.get<string>(this.NEWS_SITE));
			doc = new JSDOM(page.data, { contentType: 'application/rss+xml' }).window.document;
		} catch (e) {
			if ((e as AxiosError).isAxiosError) {
				const ae = e as AxiosError;
				this.log.error(`Error retrieving ${ae.config?.url}`, ae.stack);
				return [];
			}
			
			throw e;
		}

		const newsItems = Array.from(doc.querySelectorAll('item'))
				.filter(item => !this.isOOC(item.querySelector('title')!.textContent!));
		
		return Promise.all(newsItems.slice(0, SharedConstants.MAX_NEWS_ENTRIES).map(async item => {
			const title = item.querySelector('title')!.textContent!; // Guaranteed to exist
			const author = item.getElementsByTagName('dc:creator')[0].textContent!; // Guaranteed to exist
			const link = item.querySelector('link')!.textContent!; // Guaranteed to exist
			const date = DateTime.fromRFC2822(item.querySelector('pubDate')!.textContent!); // Guaranteed to exist

			const description = item.querySelector('description')!.textContent!; // Guaranteed to exist
			const contentHtml = parse(description);
			const contentParagraph = contentHtml.querySelector('p');
			const content = contentParagraph ? contentParagraph.textContent! : contentHtml.textContent!;

			try {
				// Get image URL from linked page
				const linkedPage = (await firstValueFrom(this.httpService.get<string>(link)));
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
					image: images.length > 0 ? images[0].getAttribute('data-src') || images[0].getAttribute('src')! : '',
					date: date.toMillis(),
				};
			} catch (e) {
				if (e instanceof Error) {
					this.log.error(e.message, e.stack);
				} else {
					this.log.error(e);
				}

				// Fallback in case we can't get the image URL
				return {
					title,
					author,
					content,
					link,
					image: '',
					date: date.toMillis(),
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
