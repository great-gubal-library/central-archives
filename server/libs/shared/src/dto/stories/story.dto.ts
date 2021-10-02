import { StoryType } from "@app/shared/enums/story-type.enum";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class StoryDto {
	@IsNumber()
	@IsOptional()
	id?: number;

	@IsBoolean()
	@IsOptional()
	mine: boolean;

	@IsString()
	@IsOptional()
	author: string;

	@IsString()
	@IsOptional()
	authorServer: string;

	@IsNumber()
	@IsOptional()
	createdAt: number;

	@IsString()
	title: string;

	@IsString()
	content: string;

	@IsEnum(StoryType)
	type: StoryType;

	@IsString({each: true})
	tags: string[];

	constructor(properties?: Readonly<StoryDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
