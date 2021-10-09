import { ImageCategory } from "@app/shared/enums/image-category.enum";
import { IsEnum, IsNumber, IsString } from "class-validator";

export class ImageUploadRequestDto {
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
