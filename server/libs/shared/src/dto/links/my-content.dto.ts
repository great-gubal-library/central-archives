import { ImageDto } from "../image/image.dto";
import { LinkResultDto } from "./link-result.dto";

export interface MyContentDto {
	stories: LinkResultDto[];
	noticeboardItems: LinkResultDto[];
	events: LinkResultDto[];
	images: ImageDto[];
}
