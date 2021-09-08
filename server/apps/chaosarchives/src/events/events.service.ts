import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { HttpService, Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import parse from 'node-html-parser';
import SharedConstants from '@app/shared/SharedConstants';
import { EventDto } from '@app/shared/dto/events/event.dto';
import utils from '../util/utils';

@Injectable()
export class EventsService {
	private readonly log = new Logger(EventsService.name);

	private readonly EVENTS_SITE = 'https://crescentmoonpublishing.com/events/';

	private readonly CACHE_DURATION_SEC = 5 * 60;

	private readonly MAX_RESULTS = 10;

	private readonly DATE_TIME_FORMAT = 'd LLLL yyyy h:mm a';

	constructor(
		@InjectRedis()
		private readonly redisService: Redis,
		private httpService: HttpService,
	) { }

	async getEvents(): Promise<EventDto[]> {
		const cachedEvents = await this.redisService.get('events');

		if (cachedEvents) {
			return JSON.parse(cachedEvents);
		}

		// Not cached - fetch and cache
		const events = await this.fetchEvents();
		this.redisService.set('events', JSON.stringify(events), 'ex', this.CACHE_DURATION_SEC); // Intentionally no await
		return events;
	}

	private async fetchEvents(): Promise<EventDto[]> {
		const response = await this.httpService.get<string>(this.EVENTS_SITE).toPromise();
		const doc = parse(response.data);

		// Sidebar events are unreliable, so we query the calendar instead
		const eventLinks = doc.querySelectorAll('.jet-listing-calendar .jet-calendar-week__day.has-events .jet-listing-dynamic-link__link');

		// Query linked pages in parallel
		const result: (EventDto|null)[] = await Promise.all(eventLinks.map(async link => {
			const name = link.querySelector('span').textContent;
			const href = link.getAttribute('href');

			if (!name || !href) {
				return null;
			}

			try {
				const linkedPage = await this.httpService.get<string>(href).toPromise();
				const linkedDoc = parse(linkedPage.data);
				const dateField = linkedDoc.querySelector('i.fa-calendar + div');
				const timeField = linkedDoc.querySelector('i.fa-clock + div');
				
				if (!dateField || !timeField) {
					return null;
				}

				const dateString = dateField.textContent.trim();
				const timeString = timeField.textContent.trim();
				const date = DateTime.fromFormat(`${dateString} ${timeString}`, this.DATE_TIME_FORMAT, {
					locale: 'en',
					zone: SharedConstants.FFXIV_SERVER_TIMEZONE,
				});

				if (!date.isValid) {
					return null;
				}

				const locationLinks = linkedDoc.querySelectorAll('.grid-col-desk-2 .elementor-heading-title a');
				const location = locationLinks.map(a => a.textContent.trim()).join(', ');

				return {
					name,
					location,
					link: href,
					date: date.toMillis(),
				};
			} catch (e) {
				this.log.error(e);
				return null;
			}
		}));
		
		const now = Date.now();

		return (result.filter(event => event !== null) as EventDto[])
			.filter(event => event.date >= now && !event.name.includes('OOC'))
			.sort((e1, e2) => utils.compareNumbers(e1.date, e2.date))
			.slice(0, this.MAX_RESULTS);
	}
}
