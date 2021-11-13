export interface ChocoboChronicleEventDto {
	id: number;
	url: string;
	title: string;
	description: string;
	utc_start_date: string;
	utc_end_date: string;
	image: {
		url: string;
	}
	organizer: {
		organizer: string;
		url: string;
	}
}
