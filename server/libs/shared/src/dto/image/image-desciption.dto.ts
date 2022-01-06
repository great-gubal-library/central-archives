import { ImageCategory } from "@app/shared/enums/image-category.enum";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class ImageDescriptionDto {
	@IsString()
	readonly title: string;
	
	@IsString()
  readonly description: string;

	@IsString()
  readonly credits: string;

	@IsEnum(ImageCategory)
  readonly category: ImageCategory;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	readonly eventId?: number;

	constructor(properties?: Readonly<ImageDescriptionDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
