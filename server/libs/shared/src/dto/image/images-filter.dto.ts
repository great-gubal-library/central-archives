import { ImageCategory } from "@app/shared/enums/image-category.enum";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PagingDto } from "../common/paging.dto";

export class ImagesFilterDto extends PagingDto {
	@IsString()
	@IsOptional()
	searchQuery?: string;

	@IsNumber()
	@IsOptional()
	characterId?: number;

	@IsNumber()
	@IsOptional()
	eventId?: number;

	@IsEnum(ImageCategory)
	@IsOptional()
	category?: ImageCategory;

	constructor(properties?: Readonly<ImagesFilterDto>) {
		super();

    if (properties) {
      Object.assign(this, properties);
    }
  }
}
