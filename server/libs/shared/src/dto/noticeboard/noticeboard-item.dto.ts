import { NoticeboardLocation } from "@app/shared/enums/noticeboard-location.enum";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class NoticeboardItemDto {
	@IsNumber()
	@IsOptional()
	id?: number;

	@IsBoolean()
	@IsOptional()
	mine: boolean;

	@IsString()
	author: string;

	@IsString()
	authorServer: string;

	@IsNumber()
	@IsOptional()
	createdAt: number;

	@IsString()
	title: string;

	@IsString()
	content: string;

	@IsEnum(NoticeboardLocation)
	location: NoticeboardLocation;

	constructor(properties?: Readonly<NoticeboardItemDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
