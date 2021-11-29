import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { EventAnnouncementDto } from "./event-announcement.dto";
import { EventDto } from "./event.dto";

export class EventEditDto extends EventDto {
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
