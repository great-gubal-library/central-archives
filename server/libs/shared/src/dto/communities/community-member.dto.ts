import { MembershipStatus } from "@app/shared/enums/membership-status.enum";

export interface CommunityMemberDto {
	characterId: number;
	name: string;
	server: string;
	status: MembershipStatus;
	canEdit: boolean;
	canManageMembers: boolean;
}
