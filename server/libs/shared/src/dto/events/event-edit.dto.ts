import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { EventNotificationDto } from "./event-notification.dto";
import { EventDto } from "./event.dto";

export class EventEditDto extends EventDto {
	@IsArray()
	@Type(() => Event)
	@ValidateNested({ each: true })
	notifications: EventNotificationDto[];

	constructor(properties?: Readonly<EventEditDto>) {
		super();

    if (properties) {
      Object.assign(this, properties);
    }
  }
}
