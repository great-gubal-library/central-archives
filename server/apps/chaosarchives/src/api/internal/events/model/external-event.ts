import { EventSummaryDto } from "@app/shared/dto/events/event-summary.dto";

export interface ExternalEvent extends EventSummaryDto {
	details: string;
}
