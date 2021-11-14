import { EventSummaryDto } from "./event-summary.dto";

export interface EventSummariesDto {
	events: EventSummaryDto[];
	eventsUpToDate: boolean;
}
