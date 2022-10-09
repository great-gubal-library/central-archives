import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from "class-validator";
import { BaseCharacterProfileDto } from "../characters/base-character-profile.dto";

export class RppCharacterProfileDto extends BaseCharacterProfileDto {
	@ApiProperty({
		example: 'A statuesque stunner with amber-colored luminous orbs.',
  })
  @IsString()
  @IsOptional()
  appearance: string;

	@ApiProperty({
		example: 'Born in Ishgard in a downtrodden peasant family...',
  })
  @IsString()
  @IsOptional()
  background: string;

	@ApiProperty({
		example: 'Red mage',
  })
  @IsString()
  @IsOptional()
  occupation: string;

	@ApiProperty({
    example: 'Elezen',
  })
  @IsString()
  @IsOptional()
  race: string;

	@ApiProperty({
    example: 'Middle-aged',
  })
  @IsString()
  @IsOptional()
  age: string;

	@ApiProperty({
		example: 'Ishgard',
  })
  @IsString()
  @IsOptional()
  birthplace: string;

	@ApiProperty({
		example: "Revenant's Toll",
  })
  @IsString()
  @IsOptional()
  residence: string;

	@ApiProperty({
		example: 'Lady',
  })
  @IsString()
  @IsOptional()
  title: string;

	@ApiProperty({
    example: 'Inkie',
  })
  @IsString()
  @IsOptional()
  nickname: string;

	@ApiProperty({
    example: 'Tomorrow is another day.',
  })
  @IsString()
  @IsOptional()
  motto: string;

	@ApiProperty({
    example: 'Her paramour, Lambert',
  })
  @IsString()
  @IsOptional()
  loves: string;

	@ApiProperty({
    example: 'Hot chocolate',
  })
  @IsString()
  @IsOptional()
  hates: string;

	@ApiProperty({
    example: 'Margaux',
  })
  @IsString()
  @IsOptional()
  friends: string;

	@ApiProperty({
    example: 'Mother: Arluelle, father: Silgryn',
  })
  @IsString()
  @IsOptional()
  relatives: string;

	@ApiProperty({
    example: 'Elisande',
  })
  @IsString()
  @IsOptional()
  enemies: string;

	@ApiProperty({
    example: 'Helping the helpless',
  })
  @IsString()
  @IsOptional()
  motivation: string;

	@ApiProperty({
    example: 'Tired, restless.',
  })
  @IsString()
  @IsOptional()
  currently: string;

	@ApiProperty({
    example: 'My Discord is: Example#1234',
  })
  @IsString()
  @IsOptional()
  oocInfo: string;

	@ApiProperty({
    example: 'She/her',
  })
  @IsString()
  @IsOptional()
  pronouns: string;

	constructor(properties?: Readonly<RppCharacterProfileDto>) {
    super();

    if (properties) {
      Object.assign(this, properties);
    }
  }
}
