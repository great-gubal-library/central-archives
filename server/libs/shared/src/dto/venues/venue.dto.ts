import { HousingArea } from '@app/shared/enums/housing-area.enum';
import { VenueLocation } from '@app/shared/enums/venue-location.enum';
import SharedConstants from '@app/shared/SharedConstants';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min, ValidateIf, ValidateNested } from 'class-validator';
import { BannerDto } from '../characters/banner.dto';

export class VenueDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsBoolean()
  mine: boolean;

	@IsString()
	owner: string;

	@IsString()
	ownerServer: string;

  @IsString()
  @IsOptional()
  foundedAt: string|null;

  @IsString()
  name: string;

  @IsString()
  server: string;
	
  @IsString()
  description: string;

  @IsString()
  website: string;

  @IsString()
  purpose: string;

  @IsString()
  status: string;

  @IsEnum(VenueLocation)
  location: VenueLocation;

  @IsString()
  @ValidateIf((object: VenueDto) => object.location === VenueLocation.OPEN_WORLD)
  address: string;

  @IsEnum(HousingArea)
  @ValidateIf((object: VenueDto) => object.location !== VenueLocation.OPEN_WORLD)
  housingArea: HousingArea|null;

  @IsNumber()
  @Min(SharedConstants.housing.MIN_WARD_NUMBER)
  @Max(SharedConstants.housing.MAX_WARD_NUMBER)
  @ValidateIf((object: VenueDto) => object.location !== VenueLocation.OPEN_WORLD)
  ward: number|null;

  @IsNumber()
  @Min(SharedConstants.housing.MIN_MAIN_WARD_PLOT)
  @ValidateIf((object: VenueDto) => object.location === VenueLocation.HOUSE)
  plot: number|null;

  @IsString()
  @ValidateIf((object: VenueDto) => object.location === VenueLocation.APARTMENT)
  room: string|null;

  @ValidateIf((object: VenueDto) => object.location !== VenueLocation.OPEN_WORLD)
  subdivision: boolean|null;

  @IsString()
  carrdProfile: string;

  @Type(() => BannerDto)
  @ValidateNested()
  @IsOptional()
  banner: BannerDto|null;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
	
	constructor(properties?: Readonly<VenueDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
