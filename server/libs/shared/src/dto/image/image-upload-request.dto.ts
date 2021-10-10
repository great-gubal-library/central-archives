import { ImageCategory } from "@app/shared/enums/image-category.enum";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsString, MinLength } from "class-validator";

export class ImageUploadRequestDto {
	@Type(() => Number)
	@IsNumber()
	readonly characterId: number;

	@IsString()
	readonly title: string;

	@IsString()
	readonly description: string;

	@IsEnum(ImageCategory)
	readonly category: ImageCategory;

	@IsString()
	@MinLength(1)
	readonly credits: string;

	@Type(() => Number)
	@IsNumber()
	readonly thumbLeft: number;

	@Type(() => Number)
	@IsNumber()
	readonly thumbTop: number;

	@Type(() => Number)
	@IsNumber()
	readonly thumbWidth: number;

	constructor(properties?: Readonly<ImageUploadRequestDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
