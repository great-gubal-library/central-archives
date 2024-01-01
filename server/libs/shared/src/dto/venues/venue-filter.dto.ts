import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PagingDto } from "../common/paging.dto";
import { HousingArea } from "@app/shared/enums/housing-area.enum";

export class VenueFilterDto extends PagingDto {
	@IsString()
	@IsOptional()
	searchQuery?: string;

	@IsEnum(HousingArea)
	@IsOptional()
	housingArea?: HousingArea;

  @IsNumber()
  @IsOptional()
  characterId?: number;
}
