import { StoryType } from "@app/shared/enums/story-type.enum";

export interface StorySummaryDto {
	id: number;
	title: string;
	author: string;
	createdAt: number;
	type: StoryType;
}
