import { ImageSummaryDto } from "../image/image-summary.dto";

export interface BaseLinkResultDto {
	id?: number;
	name?: string;
	server?: string;
	image?: ImageSummaryDto;
}
