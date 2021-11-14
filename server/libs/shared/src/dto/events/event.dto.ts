import { EventSource } from '@app/shared/enums/event-source.enum';
import { EventLocationDto } from './event-location.dto';

export interface EventDto {
  id: number;
  title: string;
  startDateTime: number;
  endDateTime: number | null;
  link: string;
	source: EventSource;
  locations: EventLocationDto[];
}
