import { NoticeboardLocation } from "@app/shared/enums/noticeboard-location.enum";

export interface NoticeboardItemSummaryDto {
	id: number;
	title: string;
	author: string;
	createdAt: number;
	location: NoticeboardLocation;
}
