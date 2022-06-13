import { IsOptional, IsString } from "class-validator";

export class NewsAuthorDto {
	@IsString()
	name: string;

	@IsString()
	server: string;

	@IsString()
	@IsOptional()
	pseudonym: string;

	constructor(properties?: Readonly<NewsAuthorDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
