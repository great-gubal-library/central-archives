import { IsNumber, IsOptional } from "class-validator";

export class EventNotificationDto {
	@IsNumber()
	@IsOptional()
	id?: number;

	@IsNumber()
	minutesBefore: number;

	constructor(properties?: Readonly<EventNotificationDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
