import { UserInfo } from '@app/auth/model/user-info';
import { Character } from '@app/entity';
import { CommunityMembership } from '@app/entity/community-membership.entity';
import { Community } from '@app/entity/community.entity';
import { CommunitySummaryDto } from '@app/shared/dto/communities/community-summary.dto';
import { CommunityDto } from '@app/shared/dto/communities/community.dto';
import { MyCommunitySummaryDto } from '@app/shared/dto/communities/my-community-summary.dto';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import crypto from 'crypto';
import { Connection, Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';

@Injectable()
export class CommunitiesService {
	constructor(
		private connection: Connection,
		@InjectRepository(Character) private characterRepo: Repository<Character>,
		@InjectRepository(Community) private communityRepo: Repository<Community>,
		@InjectRepository(CommunityMembership) private communityMembershipRepo: Repository<CommunityMembership>,
    private imagesService: ImagesService,
		) {}

	async getMyCommunities(characterId: number, user: UserInfo): Promise<MyCommunitySummaryDto[]> {
		if (!user.characters.map(ch => ch.id).includes(characterId)) {
			throw new ForbiddenException('Invalid character id');
		}

		const memberships = await this.communityMembershipRepo.createQueryBuilder('membership')
			.innerJoinAndSelect('membership.community', 'community')
			.innerJoinAndSelect('community.owner', 'owner')
			.innerJoinAndSelect('membership.character', 'character')
			.where('character.id = :characterId', { characterId })
			.select(['membership.id', 'community.id', 'community.name', 'community.goal', 'owner.id'])
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

	async getCommunities(filter: { limit?: number }, orderByDate: boolean): Promise<CommunitySummaryDto[]> {
		const query = this.communityRepo.createQueryBuilder('community')
			.orderBy(orderByDate ? { 'community.foundedAt' : 'DESC' } : { 'community.name' : 'ASC' })
			.select(['community.id', 'community.name', 'community.goal']);

		if (filter.limit) {
			query.limit(filter.limit);
		}
		
		const communities = await query.getMany();
		return communities.map(community => this.toCommunitySummary(community));
	}

	private toCommunitySummary(community: Community): CommunitySummaryDto {
		return {
			id: community.id,
			name: community.name,
			goal: community.goal,
		}
	}

	async getCommunityByName(name: string, user?: UserInfo): Promise<CommunityDto> {
		const community = await this.communityRepo.findOne({
			where: {
				name,
			},
			relations: [ 'owner', 'tags', 'banner', 'banner.owner' ]
		});

		if (!community) {
			throw new NotFoundException('Community not found');
		}

		return this.toCommunityDto(community, user);
	}

	private async toCommunityDto(community: Community, user?: UserInfo): Promise<CommunityDto> {
		const banner = await community.banner;
		
		return {
			id: community.id,
			mine: !!user && user.characters.map(ch => ch.id).includes(community.owner.id),
			foundedAt: community.foundedAt,
			name: community.name,
			owner: community.owner.name,
			ownerServer: community.owner.server.name,
			description: community.description,
			goal: community.goal,
			website: community.website,
			discord: community.discord,
			status: community.status,
			recruitingOfficers: community.recruitingOfficers,
			carrdProfile: community.carrdProfile,
			tags: community.tags.map(tag => tag.name),
			banner: !banner ? null : {
				id: banner.id,
				url: this.imagesService.getUrl(banner),
				width: banner.width,
				height: banner.height,
			}
		}
	}

	async deleteCommunity(communityId: number, user: UserInfo): Promise<void> {
		await this.connection.transaction(async em => {
			const communityRepo = em.getRepository(Community);
			const community = await communityRepo.findOne({
				where: {
					id: communityId,
					owner: {
						user: {
							id: user.id
						}
					},
				},
				relations: [ 'owner', 'owner.user' ]
			});

			if (!community) {
				throw new NotFoundException('Community not found');
			}

			// Free the name for new venues, but keep the record with a deleted flag
			community.name = `${crypto.randomUUID()} ${community.name}`;
			await communityRepo.save(community);
			await communityRepo.softRemove(community);
		});
	}
}
