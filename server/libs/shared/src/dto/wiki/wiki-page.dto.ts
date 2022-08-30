import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class WikiPageDto {
	@IsNumber()
	@IsOptional()
	id?: number;

	@IsBoolean()
	@IsOptional()
	mine: boolean;

	@IsString()
	author: string;

	@IsString()
	authorServer: string;

	@IsNumber()
	@IsOptional()
	createdAt: number;

	@IsString()
	title: string;

	@IsString()
	content: string;

	constructor(properties?: Readonly<WikiPageDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
