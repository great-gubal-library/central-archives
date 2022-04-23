import { Race } from '@app/shared/enums/race.enum';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BannerDto } from './banner.dto';
import { CharacterFreeCompanyDto } from './character-free-company.dto';

export class CharacterProfileDto {
  @IsNumber()
  id: number;

  @IsBoolean()
  mine: boolean;

  @IsString()
  name: string;

  @IsEnum(Race)
  race: Race;

  @IsString()
  server: string;

  @IsString()
  avatar: string;

  @IsNumber()
  lodestoneId: number;

  @IsBoolean()
  @IsOptional()
  active: boolean;

  // RP fields
	
  @IsString()
  appearance: string;

  @IsString()
  background: string;

  @IsString()
  occupation: string;

  @IsString()
  age: string;

  @IsString()
  birthplace: string;

  @IsString()
  residence: string;

  @IsString()
  title: string;

  @IsString()
  nickname: string;

  @IsString()
  motto: string;

  @IsString()
  loves: string;

  @IsString()
  hates: string;

  @IsString()
  friends: string;

  @IsString()
  relatives: string;

  @IsString()
  enemies: string;

  @IsString()
  motivation: string;

  @IsString()
  carrdProfile: string;

  @Type(() => BannerDto)
  @ValidateNested()
  @IsOptional()
  banner: BannerDto|null;

  @IsBoolean()
  showAvatar: boolean;

  @IsBoolean()
  showInfoboxes: boolean;

  @IsBoolean()
  combinedDescription: boolean;

  freeCompany: CharacterFreeCompanyDto|null;
	
	constructor(properties?: Readonly<CharacterProfileDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
