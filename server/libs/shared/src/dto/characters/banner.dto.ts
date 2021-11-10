import { IsNumber, IsString } from "class-validator";

export class BannerDto {
	@IsNumber()
	id: number;

	@IsString()
	url: string;

	@IsNumber()
	width: number;

	@IsNumber()
	height: number;

	constructor(properties?: Readonly<BannerDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
