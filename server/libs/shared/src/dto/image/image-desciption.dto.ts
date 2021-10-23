import { ImageCategory } from "@app/shared/enums/image-category.enum";
import { IsEnum, IsString } from "class-validator";

export class ImageDescriptionDto {
	@IsString()
	readonly title: string;
	
	@IsString()
  readonly description: string;

	@IsString()
  readonly credits: string;

	@IsEnum(ImageCategory)
  readonly category: ImageCategory;
}
