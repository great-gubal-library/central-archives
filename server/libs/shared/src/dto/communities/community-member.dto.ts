export interface CommunityMemberDto {
	characterId: number;
	name: string;
	server: string;
	confirmed: boolean;
	canEdit: boolean;
	canManageMembers: boolean;
}
