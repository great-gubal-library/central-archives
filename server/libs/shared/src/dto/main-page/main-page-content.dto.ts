import { ImageSummaryDto } from "../image/image-summary.dto";
import { NewsDto } from "../news/news.dto";
import { StorySummaryDto } from "../stories/story-summary.dto";
import { CharacterSummaryDto } from "../characters/character-summary.dto";

export interface MainPageContentDto {
	news: NewsDto[];
	newsUpToDate: boolean;
	newProfiles: CharacterSummaryDto[];
	newStories: StorySummaryDto[];
	newArtwork: ImageSummaryDto[];
	newScreenshots: ImageSummaryDto[];
}
