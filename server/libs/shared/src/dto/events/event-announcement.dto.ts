import { IsNumber, IsOptional } from "class-validator";

export class EventAnnouncementDto {
	@IsNumber()
	@IsOptional()
	id?: number;

	@IsNumber()
	minutesBefore: number;

	constructor(properties?: Readonly<EventAnnouncementDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
