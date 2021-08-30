import { Controller, Get } from '@nestjs/common';
import { EventDto } from '@app/shared/dto/events/event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
	constructor(private readonly eventsService: EventsService) {}

	@Get('/')
	async getEvents(): Promise<EventDto[]> {
		return this.eventsService.getEvents();
	}
}
