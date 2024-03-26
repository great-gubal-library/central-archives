import { PageType } from "@app/shared/enums/page-type.enum";
import SharedConstants from "@app/shared/shared-constants";
import { IsEnum, IsNumber, IsString, MinLength } from "class-validator";

export class ViolationReportDto {
	@IsEnum(PageType)
	pageType: PageType;

	@IsNumber()
	pageId: number;

	@IsString()
	@MinLength(SharedConstants.MIN_VIOLATION_REPORT_LENGTH)
	reason: string;

	constructor(properties?: Readonly<ViolationReportDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
