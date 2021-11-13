import { EventLocationDto } from "./event-location.dto";

export interface EventDto {
	name: string,
	startDate: number,
	endDate: number|null,
	link: string,
	locations: EventLocationDto[]
}
