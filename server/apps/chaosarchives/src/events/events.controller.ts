import { EventSummariesDto } from '@app/shared/dto/events/event-summaries.dto';
import { Controller, Get, ParseBoolPipe, Query } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
	constructor(private readonly eventsService: EventsService) {}

	@Get('/')
	async getEvents(@Query('refresh', ParseBoolPipe) refresh = false): Promise<EventSummariesDto> {
		return this.eventsService.getEvents(refresh);
	}
}
