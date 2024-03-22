import { CurrentUser } from '@app/authorization/decorators/current-user.decorator';
import { RoleRequired } from '@app/authorization/decorators/role-required.decorator';
import { OptionalJwtAuthGuard } from '@app/authorization/guards/optional-jwt-auth.guard';
import { UserInfo } from '@app/authorization/model/user-info';
import { BaseEventDto } from '@app/shared/dto/events/base-event.dto';
import { EventCreaterResultDto } from '@app/shared/dto/events/event-create-result.dto';
import { EventEditDto } from '@app/shared/dto/events/event-edit.dto';
import { EventSearchResultDto } from '@app/shared/dto/events/event-search-result.dto';
import { EventSummariesDto } from '@app/shared/dto/events/event-summaries.dto';
import { EventSummaryDto } from '@app/shared/dto/events/event-summary.dto';
import { Role } from '@app/shared/enums/role.enum';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { EventsService } from './events.service';
import { ClientRegion } from 'apps/chaosarchives/src/common/client-region.decorator';
import { SiteRegion } from '@app/shared/enums/region.enum';

class GetEventParamDto {
  @IsOptional()
  @Transform((val) => val.value === 'true')
  edit?: boolean;
}

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('/')
  async getEvents(@ClientRegion() region: SiteRegion, @Query('refresh', ParseBoolPipe) refresh = false): Promise<EventSummariesDto> {
    return this.eventsService.getEvents(region, refresh);
  }

  @Get('/search')
  @RoleRequired(Role.USER)
  async search(@Query('query') query: string): Promise<EventSearchResultDto[]> {
    return this.eventsService.search(query);
  }

  @Get('/month/:year/:month')
  async getByMonth(
    @ClientRegion() region: SiteRegion,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ): Promise<EventSummaryDto[]> {
    return this.eventsService.getByMonth(region, year, month);
  }

  @Get('/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async getEvent(
    @Param('id', ParseIntPipe) id: number,
    @Query() queryParams: GetEventParamDto,
    @CurrentUser() user?: UserInfo,
  ): Promise<BaseEventDto> {
    return this.eventsService.getEvent(id, queryParams.edit || false, user);
  }

  @Post()
  @RoleRequired(Role.USER)
  async createEvent(
    @Body() event: EventEditDto,
    @Query('characterId', ParseIntPipe) characterId: number,
    @CurrentUser() user: UserInfo,
  ): Promise<EventCreaterResultDto> {
    return this.eventsService.createEvent(event, characterId, user);
  }

  @Put('/:id')
  @RoleRequired(Role.USER)
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() event: EventEditDto,
    @CurrentUser() user: UserInfo,
  ): Promise<EventEditDto> {
    return this.eventsService.updateEvent(id, event, user);
  }

  @Delete('/:id')
  @RoleRequired(Role.USER)
  async deleteEvent(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserInfo): Promise<void> {
    return this.eventsService.deleteEvent(id, user);
  }
}
