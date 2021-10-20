import { ImageCategory } from "@app/shared/enums/image-category.enum";
import { IsEnum, IsNumber, IsOptional } from "class-validator";

export class ImagesFilterDto {
	@IsNumber()
	@IsOptional()
	characterId?: number;

	@IsNumber()
	@IsOptional()
	limit?: number;

	@IsEnum(ImageCategory)
	@IsOptional()
	category?: ImageCategory;

	constructor(properties?: Readonly<ImagesFilterDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
