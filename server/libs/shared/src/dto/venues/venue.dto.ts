import { HousingArea } from '@app/shared/enums/housing-area.enum';
import { VenueLocation } from '@app/shared/enums/venue-location.enum';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { BannerDto } from '../characters/banner.dto';

export class VenueDto {
  @IsNumber()
  id: number;

  @IsBoolean()
  mine: boolean;

  @IsNumber()
  foundedAt: number;

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
  @ValidateIf((object: VenueDto) => object.location !== VenueLocation.OPEN_WORLD)
  ward: number|null;

  @IsNumber()
  @ValidateIf((object: VenueDto) => object.location !== VenueLocation.OPEN_WORLD)
  plot: number|null;

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
