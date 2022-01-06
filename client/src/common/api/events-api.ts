import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { EventEditDto } from '@app/shared/dto/events/event-edit.dto';
import { EventSummariesDto } from '@app/shared/dto/events/event-summaries.dto';
import { EventDto } from '@app/shared/dto/events/event.dto';
import APITransport from './api-transport';

export default class EventsAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('events');
  }

  async getEvents(params: { refresh: boolean }): Promise<EventSummariesDto> {
    return this.transport.get<EventSummariesDto>('', params);
  }

  async getEvent(id: number): Promise<EventDto> {
    return this.transport.tokenGet<EventDto>(`${id}`);
  }

  async getEventForEdit(id: number): Promise<EventEditDto> {
    return this.transport.authGet<EventEditDto>(`${id}`, { edit: true });
  }

  async createEvent(event: EventDto, params: { characterId: number }): Promise<IdWrapper> {
    return this.transport.authPost<IdWrapper>('', event, params);
  }

  async editEvent(id: number, event: EventDto): Promise<void> {
    return this.transport.authPut<void>(`${id}`, event);
  }

  async deleteEvent(id: number): Promise<void> {
    return this.transport.authDelete<void>(`${id}`);
  }
}
