import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { BaseEventDto } from "./base-event.dto";
import { EventAnnouncementDto } from "./event-announcement.dto";

export class EventEditDto extends BaseEventDto {
	@Type(() => EventAnnouncementDto)
	@ValidateNested({ each: true })
	@IsArray()
	announcements: EventAnnouncementDto[];

	constructor(properties?: Readonly<EventEditDto>) {
		super();

    if (properties) {
      Object.assign(this, properties);
    }
  }
}
