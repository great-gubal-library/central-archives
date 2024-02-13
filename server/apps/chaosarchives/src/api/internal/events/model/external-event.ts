import { EventSummaryDto } from "@app/shared/dto/events/event-summary.dto";
import { Region } from "@app/shared/enums/region.enum";

export interface ExternalEvent extends EventSummaryDto {
	details: string;
  region: Region;
}
