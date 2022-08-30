import { EditPermission } from "@app/shared/enums/edit-permission.enum";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

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

	@IsEnum(EditPermission)
	editPermission: EditPermission;

	constructor(properties?: Readonly<WikiPageDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
