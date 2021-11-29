import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { EventNotificationDto } from "./event-notification.dto";
import { EventDto } from "./event.dto";

export class EventEditDto extends EventDto {
	@Type(() => EventNotificationDto)
	@ValidateNested({ each: true })
	@IsArray()
	notifications: EventNotificationDto[];

	constructor(properties?: Readonly<EventEditDto>) {
		super();

    if (properties) {
      Object.assign(this, properties);
    }
  }
}
