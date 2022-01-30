import { CharacterSummaryDto } from "../characters/character-summary.dto";
import { FreeCompanySummaryDto } from "../fcs/free-company-summary.dto";
import { ImageSummaryDto } from "../image/image-summary.dto";
import { NewsDto } from "../news/news.dto";
import { NoticeboardItemSummaryDto } from "../noticeboard/noticeboard-item-summary.dto";
import { StorySummaryDto } from "../stories/story-summary.dto";
import { VenueSummaryDto } from "../venues/venue-summary.dto";

export interface MainPageContentDto {
	news: NewsDto[];
	newsUpToDate: boolean;
	newProfiles: CharacterSummaryDto[];
	newFreeCompanies: FreeCompanySummaryDto[];
	newVenues: VenueSummaryDto[];
	newStories: StorySummaryDto[];
	newArtwork: ImageSummaryDto[];
	newScreenshots: ImageSummaryDto[];
	newNoticeboardItems: NoticeboardItemSummaryDto[];
}
