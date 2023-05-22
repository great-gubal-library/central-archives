import { UserInfo } from '@app/auth/model/user-info';
import { Character, Community, CommunityMembership, CommunityTag, Image } from '@app/entity';
import { CharacterIdWrapper } from '@app/shared/dto/common/character-id-wrapper.dto';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { CommunityMemberDto } from '@app/shared/dto/communities/community-member.dto';
import { CommunitySummaryDto } from '@app/shared/dto/communities/community-summary.dto';
import { CommunityDto } from '@app/shared/dto/communities/community.dto';
import { MemberFlagsDto } from '@app/shared/dto/communities/member-flags.dto';
import { MyCommunitySummaryDto } from '@app/shared/dto/communities/my-community-summary.dto';
import { MembershipStatus } from '@app/shared/enums/membership-status.enum';
import html from '@app/shared/html';
import SharedConstants from '@app/shared/SharedConstants';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import crypto from 'crypto';
import { DateTime } from 'luxon';
import { Connection, EntityManager, FindOneOptions, Repository } from 'typeorm';
import { assertUserCharacterId, checkCarrdProfile } from '../../../common/api-checks';
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
    assertUserCharacterId(characterId, user);

    const memberships = await this.communityMembershipRepo
      .createQueryBuilder('membership')
      .innerJoinAndSelect('membership.community', 'community')
      .innerJoinAndSelect('community.owner', 'owner')
      .innerJoinAndSelect('membership.character', 'character')
      .where('character.id = :characterId', { characterId })
      .select([
        'membership.id',
        'membership.status',
        'membership.canEdit',
        'community.id',
        'community.name',
        'community.goal',
        'owner.id',
      ])
      .getMany();

    return memberships.map((membership) => this.toMyCommunitySummary(membership, characterId, user));
  }

  private toMyCommunitySummary(
    membership: CommunityMembership,
    characterId: number,
    user: UserInfo,
  ): MyCommunitySummaryDto {
    const community = membership.community;

    return {
      id: community.id,
      name: community.name,
      goal: community.goal,
      canDelete: user.characters.map((ch) => ch.id).includes(community.owner.id),
      canEdit: membership.canEdit,
      membershipStatus: membership.status,
    };
  }

  async getCommunityMembers(communityId: number, user: UserInfo): Promise<CommunityMemberDto[]> {
    await this.assertEditRights(communityId, user);

    const memberships = await this.communityMembershipRepo
      .createQueryBuilder('membership')
      .innerJoinAndSelect('membership.community', 'community')
      .innerJoinAndSelect('community.owner', 'owner')
      .innerJoinAndSelect('membership.character', 'character')
      .innerJoinAndSelect('character.server', 'server')
      .innerJoinAndSelect('character.user', 'user')
      .where('community.id = :communityId', { communityId })
      .andWhere('membership.status <> :rejected', { rejected: MembershipStatus.REJECTED })
      .orderBy('character.name', 'ASC')
      .select([
        'membership.id',
        'character.id',
        'character.name',
        'character.avatar',
        'server.id',
        'server.name',
        'membership.status',
        'membership.canEdit',
        'membership.canManageMembers',
      ])
      .getMany();

    return memberships.map((membership) => ({
      characterId: membership.character.id,
      name: membership.character.name,
      server: membership.character.server.name,
      avatar: membership.character.avatar,
      status: membership.status,
      canEdit: membership.canEdit,
      canManageMembers: membership.canManageMembers,
    }));
  }

  async getCommunities(filter: { limit?: number }, orderByDate: boolean): Promise<CommunitySummaryDto[]> {
    const query = this.communityRepo
      .createQueryBuilder('community')
      .orderBy(orderByDate ? { 'community.createdAt': 'DESC' } : { 'community.name': 'ASC' })
      .select(['community.id', 'community.name', 'community.goal']);

    if (filter.limit) {
      query.limit(filter.limit);
    }

    const communities = await query.getMany();
    return communities.map((community) => this.toCommunitySummary(community));
  }

  private toCommunitySummary(community: Community): CommunitySummaryDto {
    return {
      id: community.id,
      name: community.name,
      goal: community.goal,
    };
  }

  async getCommunity(id: number, characterId?: number, user?: UserInfo): Promise<CommunityDto> {
    const community = await this.communityRepo.findOne({
      where: {
        id,
      },
      relations: ['owner', 'owner.server', 'tags', 'banner', 'banner.owner'],
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    return this.toCommunityDto(community, characterId, user);
  }

  async getCommunityByName(name: string, characterId?: number, user?: UserInfo): Promise<CommunityDto> {
    const community = await this.communityRepo.findOne({
      where: {
        name,
      },
      relations: ['owner', 'owner.server', 'tags', 'banner', 'banner.owner'],
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    return this.toCommunityDto(community, characterId, user);
  }

  private async toCommunityDto(community: Community, characterId?: number, user?: UserInfo): Promise<CommunityDto> {
    if (user && characterId && !user.characters.map((ch) => ch.id).includes(characterId)) {
      throw new ForbiddenException('Invalid character ID');
    }

    const [banner, membership] = await Promise.all([
      community.banner,
      characterId ? this.getMembership(this.communityMembershipRepo, community.id, characterId) : null,
    ]);

    return {
      id: community.id,
      mine: !!user && user.characters.map((ch) => ch.id).includes(community.owner.id),
      membershipStatus: membership ? membership.status : null,
      canEdit: !!membership && membership.canEdit,
      canManageMembers: !!membership && membership.canEdit,
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
      tags: community.tags.map((tag) => tag.name),
      banner: !banner
        ? null
        : {
            id: banner.id,
            url: this.imagesService.getUrl(banner),
            width: banner.width,
            height: banner.height,
          },
    };
  }

  async createCommunity(communityDto: CommunityDto, user: UserInfo): Promise<IdWrapper> {
    return this.connection.transaction(async (em) => {
      const character = await em.getRepository(Character).findOne({
        where: {
          name: communityDto.owner,
          server: {
            name: communityDto.ownerServer,
          },
          user: {
            id: user.id,
          },
        },
        relations: ['server', 'user'],
      });

      if (!character) {
        throw new BadRequestException('Invalid owner character');
      }

      const community = new Community();
      community.owner = character;
      community.tags = [];
      await this.saveInternal(em, community, communityDto, user);

      // Add the character as a community member
      const membership = new CommunityMembership();
      membership.character = character;
      membership.community = community;
      membership.status = MembershipStatus.CONFIRMED;
      membership.canEdit = true;
      membership.canManageMembers = true;
      await em.getRepository(CommunityMembership).save(membership);

      return { id: community.id };
    });
  }

  async editCommunity(communityDto: CommunityDto, user: UserInfo): Promise<void> {
    await this.assertEditRights(communityDto.id, user);

    await this.connection.transaction(async (em) => {
      const community = await em.getRepository(Community).findOne({
        where: {
          id: communityDto.id,
        },
        relations: ['banner', 'banner.owner', 'owner', 'tags'],
      });

      if (!community) {
        throw new NotFoundException('Community not found');
      }

      await this.saveInternal(em, community, communityDto, user);
    });
  }

  /* eslint-disable no-param-reassign */
  private async saveInternal(
    em: EntityManager,
    community: Community,
    communityDto: CommunityDto,
    user: UserInfo,
  ): Promise<void> {
    community.name = communityDto.name;
    community.description = html.sanitize(communityDto.description);
    community.website = communityDto.website; // TODO: Validate
    community.discord = communityDto.discord; // TODO: Validate
    community.goal = communityDto.goal;
    community.status = communityDto.status;
    community.recruitingOfficers = communityDto.recruitingOfficers;
    community.carrdProfile = checkCarrdProfile(communityDto.carrdProfile, user);

    // Validate founding date

    if (communityDto.foundedAt) {
      const foundedAt = DateTime.fromISO(communityDto.foundedAt, {
        zone: SharedConstants.FFXIV_SERVER_TIMEZONE,
      });

      if (!foundedAt.isValid || foundedAt.toMillis() > Date.now()) {
        throw new BadRequestException('Invalid founding date');
      }

      community.foundedAt = foundedAt.toISODate();
    } else {
      community.foundedAt = null;
    }

    // Set banner

    if (communityDto.banner && communityDto.banner.id) {
      const banner = await em.getRepository(Image).findOne({
        where: {
          id: communityDto.banner.id,
          owner: community.owner,
        },
      });

      if (!banner) {
        throw new BadRequestException('Banner not found');
      }

      if (banner.width / banner.height < SharedConstants.MIN_BANNER_ASPECT_RATIO) {
        throw new BadRequestException('Banner is too tall for its width');
      }

      community.banner = Promise.resolve(banner);
    } else {
      community.banner = Promise.resolve(null);
    }

    // Set tags

    const existingTagNames = community.tags.map((tag) => tag.name);
    const newTagNames = communityDto.tags.filter((tagName) => tagName !== '' && !existingTagNames.includes(tagName));
    const tagsToDelete = community.tags.filter((tag) => !communityDto.tags.includes(tag.name));
    const tagsToRetain = community.tags.filter((tag) => communityDto.tags.includes(tag.name));

    community.tags = [
      ...tagsToRetain,
      ...newTagNames.map(
        (tag) =>
          new CommunityTag({
            name: tag,
            community,
          }),
      ),
    ];

    if (tagsToDelete.length > 0) {
      await Promise.all(tagsToDelete.map((tag) => em.remove(tag)));
    }

    await em.save(community);
  }

  async deleteCommunity(communityId: number, user: UserInfo): Promise<void> {
    await this.connection.transaction(async (em) => {
      const communityRepo = em.getRepository(Community);
      const community = await communityRepo.findOne({
        where: {
          id: communityId,
          owner: {
            user: {
              id: user.id,
            },
          },
        },
        relations: ['owner', 'owner.user'],
      });

      if (!community) {
        throw new NotFoundException('Community not found');
      }

      // Free the name for new communitys, but keep the record with a deleted flag
      community.name = `${crypto.randomUUID()} ${community.name}`;
      await communityRepo.save(community);
      await communityRepo.softRemove(community);
    });
  }

  private async checkEditRights(communityId: number, user: UserInfo): Promise<boolean> {
    return this.checkFlag(communityId, user, false);
  }

  private async assertEditRights(communityId: number, user: UserInfo): Promise<void> {
    if (!this.checkFlag(communityId, user, false)) {
      throw new ForbiddenException('Operation not permitted');
    }
  }

  private async checkManageMembersRights(communityId: number, user: UserInfo): Promise<boolean> {
    return this.checkFlag(communityId, user, true);
  }

  private async assertManageMembersRights(communityId: number, user: UserInfo): Promise<void> {
    if (!this.checkFlag(communityId, user, true)) {
      throw new ForbiddenException('Operation not permitted');
    }
  }

  private async checkFlag(communityId: number, user: UserInfo, manageMembersFlag: boolean): Promise<boolean> {
    const flagName = manageMembersFlag ? 'canManageMembers' : 'canEdit';

    const membershipCount = await this.communityMembershipRepo
      .createQueryBuilder('membership')
      .innerJoinAndSelect('membership.community', 'community')
      .innerJoinAndSelect('membership.character', 'character')
      .where('community.id = :communityId', { communityId })
      .andWhere('character.id IN (:...characterIds)', { characterIds: user.characters.map((ch) => ch.id) })
      .andWhere(`membership.status = :status`, { status: MembershipStatus.CONFIRMED })
      .andWhere(`membership.${flagName} = :flag`, { flag: true })
      .getCount();

    return membershipCount > 0;
  }

  async applyForMembership(communityId: number, characterIdWrapper: CharacterIdWrapper, user: UserInfo): Promise<void> {
    const characterId = characterIdWrapper.characterId;
    assertUserCharacterId(characterId, user);

    await this.connection.transaction(async (em) => {
      const membershipRepo = em.getRepository(CommunityMembership);
      const existingMembership = await this.getMembership(membershipRepo, communityId, characterId);

      if (existingMembership) {
        return;
      }

      const [community, character] = await Promise.all([
        em.getRepository(Community).findOne(communityId),
        em.getRepository(Character).findOne(characterId),
      ]);

      if (!character) {
        throw new NotFoundException('Invalid character');
      }

      if (!community) {
        throw new NotFoundException('Invalid community');
      }

      const newMembership = membershipRepo.create({
        community,
        character,
        status: MembershipStatus.APPLIED,
        canEdit: false,
        canManageMembers: false,
      });

      await membershipRepo.save(newMembership);
    });
  }

  async approveMember(communityId: number, characterIdWrapper: CharacterIdWrapper, user: UserInfo): Promise<void> {
    await this.setMembershipStatus(communityId, characterIdWrapper, user, MembershipStatus.CONFIRMED);
  }

  async rejectMember(communityId: number, characterIdWrapper: CharacterIdWrapper, user: UserInfo): Promise<void> {
    await this.setMembershipStatus(communityId, characterIdWrapper, user, MembershipStatus.REJECTED);
  }

  private async setMembershipStatus(
    communityId: number,
    characterIdWrapper: CharacterIdWrapper,
    user: UserInfo,
    status: MembershipStatus,
  ): Promise<void> {
    await this.assertManageMembersRights(communityId, user);

    const characterId = characterIdWrapper.characterId;

    await this.connection.transaction(async (em) => {
      const membershipRepo = em.getRepository(CommunityMembership);
      const membership = await this.getMembership(membershipRepo, communityId, characterId, true);

      if (!membership) {
        throw new NotFoundException('Community member not found');
      }

      if (membership.status === status) {
        return;
      }

			if (status === MembershipStatus.REJECTED && characterId === membership.community.owner.id) {
				throw new ConflictException('Community owner cannot be rejected');
			}

      membership.status = status;
      await membershipRepo.save(membership);
    });
  }

	async setMemberFlags(communityId: number, characterId: number, flags: MemberFlagsDto, user: UserInfo): Promise<void> {
		await this.assertManageMembersRights(communityId, user);

		const canEdit = await this.checkEditRights(communityId, user);

    await this.connection.transaction(async (em) => {
      const membershipRepo = em.getRepository(CommunityMembership);
      const membership = await this.getMembership(membershipRepo, communityId, characterId, true);

      if (!membership) {
        throw new NotFoundException('Community member not found');
      }

			if (!canEdit && !membership.canEdit && flags.canEdit) {
				throw new ForbiddenException('You do not have edit permission and cannot set it for others');
			}

      if (membership.status !== MembershipStatus.CONFIRMED) {
        throw new ConflictException("Non-confirmed member's flags cannot be edited");
      }

			if (characterId === membership.community.owner.id) {
				throw new ConflictException('Community owner flags cannot be edited');
			}

      membership.canEdit = flags.canEdit;
			membership.canManageMembers = flags.canManageMembers;
      await membershipRepo.save(membership);
    });
  }

  private async getMembership(
    repo: Repository<CommunityMembership>,
    communityId: number,
    characterId: number,
		extended?: boolean
  ): Promise<CommunityMembership | null> {
		const options: FindOneOptions<CommunityMembership> = {
			where: {
				community: {
					id: communityId,
				},
				character: {
					id: characterId,
				},
			},
		};

		if (extended) {
			options.relations = [ 'community', 'community.owner' ];
		}

    return (
      (await repo.findOne(options)) || null
    );
  }
}
