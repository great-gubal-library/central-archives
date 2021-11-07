import { IsNumber, Min } from "class-validator";

export class AddCharacterRequestDto {
	@IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  readonly lodestoneId: number;

  constructor(properties?: Readonly<AddCharacterRequestDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
