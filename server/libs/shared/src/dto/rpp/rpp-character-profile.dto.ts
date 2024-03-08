import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from "class-validator";
import { BaseCharacterProfileDto } from "../characters/base-character-profile.dto";

export class RppCharacterProfileDto extends BaseCharacterProfileDto {
	@ApiProperty({
		example: 'A statuesque stunner with amber-colored luminous orbs.',
  })
  @IsString()
  @IsOptional()
  declare appearance: string;

	@ApiProperty({
		example: 'Born in Ishgard in a downtrodden peasant family...',
  })
  @IsString()
  @IsOptional()
  declare background: string;

	@ApiProperty({
		example: 'Red mage',
  })
  @IsString()
  @IsOptional()
  declare occupation: string;

	@ApiProperty({
    example: 'Elezen',
  })
  @IsString()
  @IsOptional()
  race: string;

  @ApiProperty({
		example: 'Nationality',
  })
  @IsString()
  @IsOptional()
  declare nationality?: string;

	@ApiProperty({
    example: 'Middle-aged',
  })
  @IsString()
  @IsOptional()
  declare age: string;

	@ApiProperty({
		example: 'Ishgard',
  })
  @IsString()
  @IsOptional()
  declare birthplace: string;

	@ApiProperty({
		example: "Revenant's Toll",
  })
  @IsString()
  @IsOptional()
  declare residence: string;

	@ApiProperty({
		example: 'Lady',
  })
  @IsString()
  @IsOptional()
  declare title: string;

	@ApiProperty({
    example: 'Inkie',
  })
  @IsString()
  @IsOptional()
  declare nickname: string;

	@ApiProperty({
    example: 'Tomorrow is another day.',
  })
  @IsString()
  @IsOptional()
  declare motto: string;

	@ApiProperty({
    example: 'Her paramour, Lambert',
  })
  @IsString()
  @IsOptional()
  declare loves: string;

	@ApiProperty({
    example: 'Hot chocolate',
  })
  @IsString()
  @IsOptional()
  declare hates: string;

	@ApiProperty({
    example: 'Margaux',
  })
  @IsString()
  @IsOptional()
  declare friends: string;

	@ApiProperty({
    example: 'Mother: Arluelle, father: Silgryn',
  })
  @IsString()
  @IsOptional()
  declare relatives: string;

	@ApiProperty({
    example: 'Elisande',
  })
  @IsString()
  @IsOptional()
  declare enemies: string;

	@ApiProperty({
    example: 'Helping the helpless',
  })
  @IsString()
  @IsOptional()
  declare motivation: string;

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
  declare pronouns: string;

	constructor(properties?: Readonly<RppCharacterProfileDto>) {
    super();

    if (properties) {
      Object.assign(this, properties);
    }
  }
}
