import { ImageSummaryDto } from "../image/image-summary.dto";
import { StorySummaryDto } from "../stories/story-summary.dto";

export interface CharacterContentDto {
	stories: StorySummaryDto[];
	images: ImageSummaryDto[];
}
