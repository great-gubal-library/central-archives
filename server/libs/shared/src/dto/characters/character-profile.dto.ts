import { Race } from '@app/shared/enums/race.enum';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BannerDto } from './banner.dto';

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
	
	constructor(properties?: Readonly<CharacterProfileDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
