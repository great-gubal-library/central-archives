import { ApiProperty } from '@nestjs/swagger';
import { IsString } from "class-validator";
import { BaseCharacterProfileDto } from "../characters/base-character-profile.dto";

export class RppCharacterProfileDto extends BaseCharacterProfileDto {
	@ApiProperty({
		example: 'A statuesque stunner with amber-colored luminous orbs.',
  })
  @IsString()
  appearance: string;

	@ApiProperty({
		example: 'Born in Ishgard in a downtrodden peasant family...',
  })
  @IsString()
  background: string;

	@ApiProperty({
		example: 'Red mage',
  })
  @IsString()
  occupation: string;

	@ApiProperty({
    example: 'Elezen',
  })
  @IsString()
  race: string;

	@ApiProperty({
    example: 'Middle-aged',
  })
  @IsString()
  age: string;

	@ApiProperty({
		example: 'Ishgard',
  })
  @IsString()
  birthplace: string;

	@ApiProperty({
		example: "Revenant's Toll",
  })
  @IsString()
  residence: string;

	@ApiProperty({
		example: 'Lady',
  })
  @IsString()
  title: string;

	@ApiProperty({
    example: 'Inkie',
  })
  @IsString()
  nickname: string;

	@ApiProperty({
    example: 'Tomorrow is another day.',
  })
  @IsString()
  motto: string;

	@ApiProperty({
    example: 'Her paramour, Lambert',
  })
  @IsString()
  loves: string;

	@ApiProperty({
    example: 'Hot chocolate',
  })
  @IsString()
  hates: string;

	@ApiProperty({
    example: 'Margaux',
  })
  @IsString()
  friends: string;

	@ApiProperty({
    example: 'Mother: Arluelle, father: Silgryn',
  })
  @IsString()
  relatives: string;

	@ApiProperty({
    example: 'Elisande',
  })
  @IsString()
  enemies: string;

	@ApiProperty({
    example: 'Helping the helpless',
  })
  @IsString()
  motivation: string;

	@ApiProperty({
    example: 'Tired, restless.',
  })
  @IsString()
  currently: string;

	@ApiProperty({
    example: 'My Discord is: Example#1234',
  })
  @IsString()
  oocInfo: string;

	@ApiProperty({
    example: 'She/her',
  })
  @IsString()
  pronouns: string;

	constructor(properties?: Readonly<RppCharacterProfileDto>) {
    super();

    if (properties) {
      Object.assign(this, properties);
    }
  }
}
