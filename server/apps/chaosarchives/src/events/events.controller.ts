import { Controller, Get } from '@nestjs/common';
import { EventInfo } from './dto/EventInfo';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
	constructor(private readonly eventsService: EventsService) {}

	@Get('/')
	async getEvents(): Promise<EventInfo[]> {
		return this.eventsService.getEvents();
	}
}
