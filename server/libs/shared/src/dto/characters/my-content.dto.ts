import { ImageDto } from "../image/image.dto";
import { MyContentItemDto } from "./my-content-item.dto";

export interface MyContentDto {
	stories: MyContentItemDto[];
	noticeboardItems: MyContentItemDto[];
	wikiPages: MyContentItemDto[];
	events: MyContentItemDto[];
	images: ImageDto[];
}
