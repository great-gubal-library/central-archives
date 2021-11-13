import { EventDto } from '@app/shared/dto/events/event.dto';
import { HttpService, Injectable, Logger } from '@nestjs/common';
import { decode } from 'html-entities';
import { DateTime } from 'luxon';
import { ChocoboChronicleEventsDto } from './dto/chocobo-chronicle-events.dto';

@Injectable()
export class ChocoboChronicleService {
	private readonly log = new Logger(ChocoboChronicleService.name);

	private readonly EVENTS_API_URL = 'https://chocobochronicle.co.uk/wp-json/tribe/events/v1/events';

	private readonly DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

	constructor(
		private httpService: HttpService,
	) { }

	async fetchEvents(): Promise<EventDto[]> {
		const response = await this.httpService.get<ChocoboChronicleEventsDto>(this.EVENTS_API_URL).toPromise();
		const events = response.data.events;
		const now = Date.now();

		return events.map(event => (<EventDto>{
			name: decode(event.title),
			location: '',
			date: DateTime.fromFormat(event.utc_start_date, this.DATE_TIME_FORMAT, {
				zone: 'UTC'
			}).toMillis(),
			image: event.image.url,
			link: event.url
		})).filter(event => event.date >= now);
	}
}
