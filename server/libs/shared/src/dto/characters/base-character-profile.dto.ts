import { IsString } from "class-validator";

export class BaseCharacterProfileDto {
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
}
