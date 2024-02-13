import { EventLocationDto } from '@app/shared/dto/events/event-location.dto';
import { EventSource } from '@app/shared/enums/event-source.enum';
import SharedConstants from '@app/shared/SharedConstants';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { decode } from 'html-entities';
import { DateTime } from 'luxon';
import parse from 'node-html-parser';
import { firstValueFrom } from 'rxjs';
import { ChocoboChronicleEventsDto } from './dto/chocobo-chronicle-events.dto';
import { ExternalEvent } from './model/external-event';
import { isRecurringEvent } from './util/event-utils';
import { Region } from '@app/shared/enums/region.enum';

@Injectable()
export class ChocoboChronicleService {
	private readonly log = new Logger(ChocoboChronicleService.name);

	private readonly EVENTS_API_URL = 'https://chocobochronicle.co.uk/wp-json/tribe/events/v1/events';

	private readonly DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

	constructor(
		private httpService: HttpService,
	) { }

	async fetchEvents(): Promise<ExternalEvent[]> {
		const response = await firstValueFrom(this.httpService.get<ChocoboChronicleEventsDto>(this.EVENTS_API_URL));
		const events = response.data.events;
    const today = DateTime.now()
      .setZone(SharedConstants.FFXIV_SERVER_TIMEZONE)
      .startOf('day')
			.toMillis();

		return events.map(event => (<ExternalEvent>{
			id: -1,
      region: Region.EU,
			title: this.processTitle(event.title),
			details: event.description,
			recurring: isRecurringEvent(event.title),
			startDateTime: this.parseDate(event.utc_start_date),
			endDateTime: this.parseDate(event.utc_end_date),
			image: event.image.url,
			link: event.url,
			locations: this.parseLocations(event.description),
			source: EventSource.CHOCOBO_CHRONICLE,
		})).filter(event => event.startDateTime >= today && this.isPublicEvent(event));
	}

	private isPublicEvent(event: ExternalEvent): boolean {
		// These are for employees only, so filter them out
		return !event.title.toLowerCase().includes('private card reading');
	}

	private processTitle(title: string): string {
		// Cut date from event title for aesthetic reasons
		return decode(title).replace(/ (– )?\d{4} – \d{2} – \d{2}/, '').replace(/\d{4}-\d{2}-\d{2}/, '');
	}

	private parseDate(date: string): number {
		return DateTime.fromFormat(date, this.DATE_TIME_FORMAT, {
			zone: 'UTC'
		}).toMillis();
	}

	private parseLocations(description: string): EventLocationDto[] {
		const doc = parse(description);
		const tableColumns = doc.querySelectorAll('td');

		try {
			return tableColumns.map(column => {
				try {
					// Here's hoping they won't change the layout and break everything...
					const divs = column.querySelectorAll('div');
					const name = divs[0].textContent.trim();
					const server = divs[3].textContent.trim();
					const address = divs[5].textContent.trim();
					const tags = divs[7].textContent.trim();

					return {
						id: -1,
						name,
						address,
						server,
						tags,
						link: '',
					};
				} catch (e) {
					this.log.error(`Error parsing HTML: ${column.outerHTML}`, (e as Error).stack);
					throw e;
				}
			});
		} catch (e) {
			return [];
		}
	}
}
