import { PageType } from "@app/shared/enums/page-type.enum";
import { ImageSummaryDto } from "../image/image-summary.dto";

export interface LinkResultDto {
	type: PageType;
	id?: number;
	name?: string;
	server?: string;
	image?: ImageSummaryDto;
}
