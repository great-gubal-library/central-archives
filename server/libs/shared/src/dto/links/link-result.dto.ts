import { PageType } from "@app/shared/enums/page-type.enum";
import { BaseLinkResultDto } from "../common/base-link-result.dto";

export interface LinkResultDto extends BaseLinkResultDto {
	type: PageType;
}
