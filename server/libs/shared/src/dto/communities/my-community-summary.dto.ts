import { MembershipStatus } from "@app/shared/enums/membership-status.enum";
import { CommunitySummaryDto } from "./community-summary.dto";

export interface MyCommunitySummaryDto extends CommunitySummaryDto {
	membershipStatus: MembershipStatus;
	canEdit: boolean;
	canDelete: boolean;
}
