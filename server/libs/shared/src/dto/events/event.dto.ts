import { IsBoolean, isBoolean, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class EventDto {
	@IsString()
	@MinLength(1)
	title: string;

	@IsBoolean()
	@IsOptional()
	mine: boolean;

	@IsString()
	details: string;

	@IsString()
	oocDetails: string;

	@IsNumber()
	startDateTime: number;

	@IsNumber()
	@IsOptional()
	endDateTime: number|null;

	@IsString()
	link: string;

	@IsString()
	contact: string;

	@IsString()
	locationName: string;

	@IsString()
	locationAddress: string;

	@IsString()
	locationServer: string;

	@IsString()
	locationTags: string;

	constructor(properties?: Readonly<EventDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
