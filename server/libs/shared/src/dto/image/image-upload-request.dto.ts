import { ImageCategory } from "@app/shared/enums/image-category.enum";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsString } from "class-validator";

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

	constructor(properties?: Readonly<ImageUploadRequestDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
