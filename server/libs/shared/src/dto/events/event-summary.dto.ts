import { EventSource } from '@app/shared/enums/event-source.enum';
import { EventLocationDto } from './event-location.dto';
import { Region } from '@app/shared/enums/region.enum';

export interface EventSummaryDto {
  id: number;
  title: string;
  startDateTime: number;
  endDateTime: number | null;
  link: string;
	source: EventSource;
  recurring: boolean;
  region: Region;
  locations: EventLocationDto[];
}
