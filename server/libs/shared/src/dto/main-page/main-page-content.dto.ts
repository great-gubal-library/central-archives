import { ImageSummaryDto } from "../image/image-summary.dto";
import { NewsDto } from "../news/news.dto";
import { StorySummaryDto } from "../stories/story-summary.dto";
import { NewProfileDto } from "./new-profile.dto";

export interface MainPageContentDto {
	news: NewsDto[];
	newsUpToDate: boolean;
	newProfiles: NewProfileDto[];
	newStories: StorySummaryDto[];
	newArtwork: ImageSummaryDto[];
	newScreenshots: ImageSummaryDto[];
}
