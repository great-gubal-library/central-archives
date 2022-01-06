import { IsOptional } from "class-validator";
import { ImageSummaryDto } from "../image/image-summary.dto";
import { BaseEventDto } from "./base-event.dto";

export class EventDto extends BaseEventDto {
	// Read only
	@IsOptional()
	images: ImageSummaryDto[];

	constructor(properties?: Readonly<EventDto>) {
		super();

    if (properties) {
      Object.assign(this, properties);
    }
  }
}
