import { IsNumber, Min } from 'class-validator';

export class VerifyCharacterDto {
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  readonly id: number;

  constructor(properties?: Readonly<VerifyCharacterDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
