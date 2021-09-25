import { NewsDto } from "../news/news.dto";
import { NewProfileDto } from "./new-profile.dto";

export interface MainPageContentDto {
	news: NewsDto[];
	newProfiles: NewProfileDto[];
}
