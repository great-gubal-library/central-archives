import { EventDto } from '@app/shared/dto/events/event.dto';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import utils from '../common/utils';
import { ChocoboChronicleService } from './chocobo-chronicle.service';
import { CrescentMoonPublishingService } from './crescent-moon-publishing.service';

@Injectable()
export class EventsService {
	private readonly CACHE_DURATION_SEC = 5 * 60;

	private readonly MAX_RESULTS = 10;

	constructor(
		@InjectRedis()
		private readonly redisService: Redis,
		private readonly cmpService: CrescentMoonPublishingService,
		private readonly ccService: ChocoboChronicleService,
	) { }

	async getEvents(): Promise<EventDto[]> {
		const cachedEvents = await this.redisService.get('events');

		if (cachedEvents) {
			return JSON.parse(cachedEvents);
		}

		// Not cached - fetch and cache
		const [cmpEvents, ccEvents] = await Promise.all([
			this.cmpService.fetchEvents(),
			this.ccService.fetchEvents(),
		]);
		
		const events = [ ...cmpEvents, ...ccEvents ]
				.sort((e1, e2) => utils.compareNumbers(e1.date, e2.date))
				.slice(0, this.MAX_RESULTS);
		this.redisService.set('events', JSON.stringify(events), 'ex', this.CACHE_DURATION_SEC); // Intentionally no await
		return events;
	}
}
