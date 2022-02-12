import { CommunitySummaryDto } from "./community-summary.dto";

export interface MyCommunitySummaryDto extends CommunitySummaryDto {
	mine: boolean;
}
