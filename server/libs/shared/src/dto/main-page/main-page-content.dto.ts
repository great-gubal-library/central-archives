import { ImageDto } from "../image/image.dto";
import { NewsDto } from "../news/news.dto";
import { StorySummaryDto } from "../stories/story-summary.dto";
import { NewProfileDto } from "./new-profile.dto";

export interface MainPageContentDto {
	news: NewsDto[];
	newsUpToDate: boolean;
	newProfiles: NewProfileDto[];
	newStories: StorySummaryDto[];
	newArtwork: ImageDto[];
	newScreenshots: ImageDto[];
}
