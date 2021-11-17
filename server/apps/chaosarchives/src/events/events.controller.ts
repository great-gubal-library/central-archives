import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { RoleRequired } from '@app/auth/decorators/role-required.decorator';
import { OptionalJwtAuthGuard } from '@app/auth/guards/optional-jwt-auth.guard';
import { UserInfo } from '@app/auth/model/user-info';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { EventSummariesDto } from '@app/shared/dto/events/event-summaries.dto';
import { EventDto } from '@app/shared/dto/events/event.dto';
import { Role } from '@app/shared/enums/role.enum';
import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('/')
  async getEvents(@Query('refresh', ParseBoolPipe) refresh = false): Promise<EventSummariesDto> {
    return this.eventsService.getEvents(refresh);
  }

  @Get('/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async getEvent(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: UserInfo): Promise<EventDto> {
    return this.eventsService.getEvent(id, user);
  }

	@Post()
  @RoleRequired(Role.USER)
  async createEvent(
    @Body() event: EventDto,
		@Query('characterId', ParseIntPipe) characterId: number,
    @CurrentUser() user: UserInfo,
  ): Promise<IdWrapper> {
    return this.eventsService.createEvent(event, characterId, user);
  }

  @Put('/:id')
  @RoleRequired(Role.USER)
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() event: EventDto,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.eventsService.updateEvent(id, event, user);
  }

  @Delete('/:id')
  @RoleRequired(Role.USER)
  async deleteEvent(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.eventsService.deleteEvent(id, user);
  }
}
