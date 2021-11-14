import { Controller, Get } from '@nestjs/common';
import { EventSummaryDto } from '@app/shared/dto/events/event-summary.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
	constructor(private readonly eventsService: EventsService) {}

	@Get('/')
	async getEvents(): Promise<EventSummaryDto[]> {
		return (await this.eventsService.getEvents()).events;
	}
}
