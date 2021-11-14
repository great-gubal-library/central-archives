import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '@app/auth/guards/optional-jwt-auth.guard';
import { UserInfo } from '@app/auth/model/user-info';
import { EventSummariesDto } from '@app/shared/dto/events/event-summaries.dto';
import { EventDto } from '@app/shared/dto/events/event.dto';
import { Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
	constructor(private readonly eventsService: EventsService) {}

	@Get('/')
	async getEvents(@Query('refresh', ParseBoolPipe) refresh = false): Promise<EventSummariesDto> {
		return this.eventsService.getEvents(refresh);
	}

	@Get("/:id")
	@UseGuards(OptionalJwtAuthGuard)
	async getEvent(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: UserInfo): Promise<EventDto> {
		return this.eventsService.getEvent(id, user);
	}
}
