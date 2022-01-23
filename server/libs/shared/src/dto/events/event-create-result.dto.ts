import { IsNumber } from "class-validator";
import { EventEditDto } from "./event-edit.dto";

export class EventCreaterResultDto extends EventEditDto {
	@IsNumber()
	id: number;

	constructor(properties?: Readonly<EventCreaterResultDto>) {
		super();

    if (properties) {
      Object.assign(this, properties);
    }
  }
}
