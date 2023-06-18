import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class ImageReplaceRequestDto {
	@Type(() => Number)
	@IsNumber()
	readonly thumbLeft: number;

	@Type(() => Number)
	@IsNumber()
	readonly thumbTop: number;

	@Type(() => Number)
	@IsNumber()
	readonly thumbWidth: number;

	constructor(properties?: Readonly<ImageReplaceRequestDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
