import { EventLocationDto } from '@app/shared/dto/events/event-location.dto';
import { EventSummaryDto } from '@app/shared/dto/events/event-summary.dto';
import { EventSource } from '@app/shared/enums/event-source.enum';
import SharedConstants from '@app/shared/SharedConstants';
import { HttpService, Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import parse from 'node-html-parser';
import utils from '../common/utils';
import { ExternalEvent } from './model/external-event';


@Injectable()
export class CrescentMoonPublishingService {
	private readonly log = new Logger(CrescentMoonPublishingService.name);

	private readonly EVENTS_SITE = 'https://crescentmoonpublishing.com/events/';

	// CMP sometimes uses different date formats on event pages because they're human-created. It's a mess.
	private readonly DATE_TIME_FORMATS = [
		'd LLLL yyyy h:mm a',
		'd LLL yyyy h:mm a',
		'd LLLL h:mm a',
		'd LLL h:mm a',
	];

	constructor(
		private httpService: HttpService,
	) { }

	async fetchEvents(): Promise<ExternalEvent[]> {
		const response = await this.httpService.get<string>(this.EVENTS_SITE).toPromise();
		const doc = parse(response.data);

		// Sidebar events are unreliable, so we query the calendar instead
		const calendarItems = doc.querySelectorAll('.jet-listing-calendar .jet-calendar-week__day .jet-engine-listing-overlay-wrap');

		// Query linked pages in parallel
		const result: (EventSummaryDto|null)[] = await Promise.all(calendarItems.map(async calendarItem => {
			const name = calendarItem.querySelector('.jet-listing-dynamic-field__content').textContent;
			const href = calendarItem.getAttribute('data-url');

			if (!name || !href) {
				return null;
			}

			try {
				const linkedPage = await this.httpService.get<string>(href).toPromise();
				const linkedDoc = parse(linkedPage.data);
				const dateField = linkedDoc.querySelector('i.fa-calendar + div');
				const timeField = linkedDoc.querySelector('i.fa-clock + div');
				
				if (!dateField || !timeField) {
					this.log.warn('No date/time found');
					return null;
				}

				const dateTimeString = `${dateField.textContent.trim()} ${timeField.textContent.trim()}`;
				const dateParseOptions = {
					locale: 'en',
					zone: SharedConstants.FFXIV_SERVER_TIMEZONE,
				};
				let date: DateTime;
				
				// Try different formats in an attempt to make sense of human-typed dates
				for (const format of this.DATE_TIME_FORMATS) {
					date = DateTime.fromFormat(dateTimeString, format, dateParseOptions);

					if (date.isValid) {
						break;
					}
				}

				// Non-null coercion is safe because date is guaranteed to be assigned at least once.
				if (!date!.isValid) {
					this.log.warn(`Invalid date: ${dateTimeString}`);
					return null;
				}

				const locationLinks = linkedDoc.querySelectorAll('.grid-col-desk-2 .elementor-heading-title a');
				const locations: EventLocationDto[] = locationLinks.map(a => ({
					id: -1,
					name: a.textContent.trim(),
					address: '',
					server: '',
					tags: '',
				}));

				return {
					id: -1,
					title: name,
					details: '',
					locations,
					link: href,
					startDateTime: date!.toMillis(),
					endDateTime: null,
					source: EventSource.CRESCENT_MOON_PUBLISHING,
				};
			} catch (e) {
				this.log.error(e);
				return null;
			}
		}));
		
		const startOfDay = DateTime.now().setZone(SharedConstants.FFXIV_SERVER_TIMEZONE).startOf('day').toMillis();

		return (result.filter(event => event !== null) as ExternalEvent[])
			.filter(event => event.startDateTime >= startOfDay && !event.title.includes('OOC'))
			.sort((e1, e2) => utils.compareNumbers(e1.startDateTime, e2.startDateTime));
	}
}
