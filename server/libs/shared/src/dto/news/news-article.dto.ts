import { NewsStatus } from "@app/shared/enums/news-status.enum";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { NewsAuthorDto } from "./news-author.dto";

export class NewsArticleDto {
	@IsInt()
	@IsOptional()
  id?: number;

	@IsBoolean()
	@IsOptional()
	canEdit: boolean;

	@IsBoolean()
	@IsOptional()
	canDelete: boolean;

	@IsString()
	@IsNotEmpty()
  title: string;

	@IsString()
  subtitle: string;

	@IsString()
	@IsOptional()
  slug: string;

	@IsString()
	@IsNotEmpty()
  summary: string;

	@IsString()
	@IsNotEmpty()
  content: string;

	@IsEnum(NewsStatus)
	status: NewsStatus;

	@IsNumber()
	@IsOptional()
  publishedAt: number | null;

	@IsString()
	@IsOptional()
  category: string;

  @Type(() => NewsAuthorDto)
  @ValidateNested()
  author: NewsAuthorDto;

	constructor(properties?: Readonly<NewsArticleDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
