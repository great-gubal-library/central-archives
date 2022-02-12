import { UserInfo } from '@app/auth/model/user-info';
import { Character } from '@app/entity';
import { CommunityMembership } from '@app/entity/community-membership.entity';
import { Community } from '@app/entity/community.entity';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { MyCommunitySummaryDto } from '@app/shared/dto/communities/my-community-summary.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

@Injectable()
export class CommunitiesService {
	constructor(
		private connection: Connection,
		@InjectRepository(Character) private characterRepo: Repository<Character>,
		@InjectRepository(CommunityMembership) private communityMembershipRepo: Repository<CommunityMembership>,
		) {}

	async getMyCommunities(characterId: number, user: UserInfo): Promise<MyCommunitySummaryDto[]> {
		if (!user.characters.map(ch => ch.id).includes(characterId)) {
			throw new ForbiddenException('Invalid character id');
		}

		const memberships = await this.communityMembershipRepo.createQueryBuilder('membership')
			.innerJoinAndSelect('membership.community', 'community')
			.innerJoinAndSelect('membership.character', 'character')
			.where('character.id = :characterId', { characterId })
			.select(['membership.id', 'community.id', 'community.name', 'community.goal', 'community.owner.id'])
			.getMany();

		return memberships.map(membership => this.toMyCommunitySummary(membership.community, user));
	}

	private toMyCommunitySummary(community: Community, user: UserInfo): MyCommunitySummaryDto {
		return {
			id: community.id,
			name: community.name,
			goal: community.goal,
			mine: user.characters.map(ch => ch.id).includes(community.owner.id),
		}
	}
}
