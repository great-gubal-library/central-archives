import { EventDto } from '@app/shared/dto/events/event.dto';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { CrescentMoonPublishingService } from './crescent-moon-publishing.service';

@Injectable()
export class EventsService {
	private readonly CACHE_DURATION_SEC = 5 * 60;

	private readonly MAX_RESULTS = 10;

	constructor(
		@InjectRedis()
		private readonly redisService: Redis,
		private readonly cmpService: CrescentMoonPublishingService,
	) { }

	async getEvents(): Promise<EventDto[]> {
		const cachedEvents = await this.redisService.get('events');

		if (cachedEvents) {
			return JSON.parse(cachedEvents);
		}

		// Not cached - fetch and cache
		const events = (await this.cmpService.fetchEvents()).slice(0, this.MAX_RESULTS);
		this.redisService.set('events', JSON.stringify(events), 'ex', this.CACHE_DURATION_SEC); // Intentionally no await
		return events;
	}
}
