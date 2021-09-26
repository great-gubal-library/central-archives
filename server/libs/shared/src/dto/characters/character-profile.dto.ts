import { Race } from '@app/shared/enums/race.enum';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';

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
	
	constructor(properties?: Readonly<CharacterProfileDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
