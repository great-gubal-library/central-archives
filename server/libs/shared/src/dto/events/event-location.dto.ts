import { IsInt, IsOptional, IsString } from "class-validator";

export class EventLocationDto {
	@IsInt()
	@IsOptional()
	id?: number;

	@IsString()
	name: string;

	@IsString()
	address: string;

	@IsString()
	server: string;

	@IsString()
	tags: string;

	constructor(properties?: Readonly<EventLocationDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
