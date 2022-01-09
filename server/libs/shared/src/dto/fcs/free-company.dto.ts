import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BannerDto } from '../characters/banner.dto';

export class FreeCompanyDto {
  @IsNumber()
  id: number;

  @IsBoolean()
  mine: boolean;

  @IsBoolean()
  claimed: boolean;

  @IsNumber()
  foundedAt: number;

  @IsString()
  name: string;

  @IsString()
  tag: string;

  @IsString()
  server: string;

  @IsArray()
  crest: string[];

  @IsString()
  lodestoneId: string;

  // RP fields
	
  @IsString()
  description: string;

  @IsString()
  website: string;

  @IsString()
  goal: string;

  @IsString()
  status: string;

  @IsString()
  carrdProfile: string;

  @Type(() => BannerDto)
  @ValidateNested()
  @IsOptional()
  banner: BannerDto|null;
	
	constructor(properties?: Readonly<FreeCompanyDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
