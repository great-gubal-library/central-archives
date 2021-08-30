import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { HttpService, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import parse from 'node-html-parser';
import SharedConstants from '@app/shared/SharedConstants';
import { EventInfo } from '@app/shared/dto/events/EventInfo';

@Injectable()
export class EventsService {
	private readonly EVENTS_SITE = 'https://crescentmoonpublishing.com/events/';

	private readonly CACHE_DURATION_SEC = 5 * 60;

	private readonly DATE_TIME_FORMAT = 'LLLL dd, yyyy h:mma';

	constructor(
		@InjectRedis()
		private readonly redisService: Redis,
		private httpService: HttpService,
	) { }

	async getEvents(): Promise<EventInfo[]> {
		const cachedEvents = await this.redisService.get('events');

		if (cachedEvents) {
			return JSON.parse(cachedEvents);
		}

		// Not cached - fetch and cache
		const events = await this.fetchEvents();
		this.redisService.set('events', JSON.stringify(events), 'ex', this.CACHE_DURATION_SEC); // Intentionally no await
		return events;
	}

	private async fetchEvents(): Promise<EventInfo[]> {
		const response = await this.httpService.get<string>(this.EVENTS_SITE).toPromise();
		const doc = parse(response.data);
		const eventsItems = doc.querySelectorAll('.grid-col-desk-1 .jet-listing-grid__item');

		return eventsItems.map(item => {
			const nameLink = item.querySelector('a');
			const fields = item.querySelectorAll('.jet-listing-dynamic-field__content');
			const dateString = `${fields[0].textContent} ${fields[1].textContent}`;
			const date = DateTime.fromFormat(dateString, this.DATE_TIME_FORMAT, {
				locale: 'en',
				zone: SharedConstants.FFXIV_SERVER_TIMEZONE,
			});

			return {
				name: nameLink.querySelector('span').textContent || '',
				location: fields[2].textContent || '',
				link: nameLink.getAttribute('href') || '',
				date: date.toMillis(),
			}
		});
	}
}
