import { IsNumber, IsOptional, IsString } from "class-validator";

export class EventAnnouncementDto {
	@IsNumber()
	@IsOptional()
	id?: number;

	@IsNumber()
	minutesBefore: number;

	@IsString()
	content: string;

	constructor(properties?: Readonly<EventAnnouncementDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
