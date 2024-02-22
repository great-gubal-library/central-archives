import { AuthService } from '@app/auth/auth.service';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { UserInfo } from '@app/auth/model/user-info';
import { Character, CommunityMembership, Image, Server, User } from '@app/entity';
import { generateVerificationCode } from '@app/security';
import { AddCharacterRequestDto } from '@app/shared/dto/characters/add-character-request.dto';
import { BannerDto } from '@app/shared/dto/characters/banner.dto';
import { CharacterProfileFilterDto } from '@app/shared/dto/characters/character-profile-filter.dto';
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { CharacterRefreshResultDto } from '@app/shared/dto/characters/character-refresh-result.dto';
import { CharacterRegistrationStatusResultDto } from '@app/shared/dto/characters/character-registration-status-result.dto';
import { CharacterSummaryDto } from '@app/shared/dto/characters/character-summary.dto';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { PagingResultDto } from '@app/shared/dto/common/paging-result.dto';
import { SessionCharacterDto } from '@app/shared/dto/user/session-character.dto';
import { CharacterRegistrationStatus } from '@app/shared/enums/character-registration-status.enum';
import { MembershipStatus } from '@app/shared/enums/membership-status.enum';
import html from '@app/shared/html';
import SharedConstants from '@app/shared/SharedConstants';
import { BadRequestException, ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Not, Repository } from 'typeorm';
import { checkCarrdProfile } from '../../../common/api-checks';
import { andWhereExists, escapeForLike, isQueryFailedError } from '../../../common/db';
import { ImagesService } from '../images/images.service';
import { VisibilityInPlayerProfile } from '@app/shared/enums/visibility-in-player-profile.enum';
import { getRaceByName } from '@app/shared/enums/race.enum';
import { LodestoneService } from '../lodestone/lodestone.service';
import { Region, SiteRegion } from '@app/shared/enums/region.enum';

@Injectable()
export class CharactersService {
  constructor(
    private publicAuthService: AuthService,
    private imagesService: ImagesService,
    private lodestoneService: LodestoneService,
    private connection: DataSource,
    @InjectRepository(Character) private characterRepo: Repository<Character>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(CommunityMembership) private communityMembershipRepo: Repository<CommunityMembership>,
    private eventEmitter: EventEmitter2,
  ) {}

  async getCharacterProfile(
    name: string,
    server: string,
    @CurrentUser() user?: UserInfo,
  ): Promise<CharacterProfileDto> {
    const character = await this.characterRepo
      .createQueryBuilder('character')
      .innerJoinAndSelect('character.server', 'server')
      .innerJoinAndSelect('character.user', 'user')
      .leftJoinAndSelect('character.freeCompany', 'freeCompany')
      .leftJoinAndSelect('freeCompany.server', 'fcServer')
      .where('character.verifiedAt IS NOT NULL')
      .andWhere('character.name = :name', { name })
      .andWhere('server.name = :server', { server })
      .select([
        'character',
        'server.name',
        'user.id',
        'user.playerName',
        'user.publicPlayerProfile',
        'freeCompany',
        'fcServer.name',
      ])
      .getOne();

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    const userEntity = (await this.userRepo.findOne({
      where: {
        id: user?.id,
      },
      select: [ 'id', 'publicPlayerProfile' ]
    }))!; // Guaranteed to exist

    let visibilityInPlayerProfile: VisibilityInPlayerProfile;

    if (!userEntity.publicPlayerProfile) {
      visibilityInPlayerProfile = VisibilityInPlayerProfile.DISABLED;
    } else if (character.showInPlayerProfile) {
      visibilityInPlayerProfile = VisibilityInPlayerProfile.SHOW;
    } else {
      visibilityInPlayerProfile = VisibilityInPlayerProfile.HIDE;
    }

		// TODO: Refactor
    const banner = await character.banner;

    if (banner) {
      banner.owner = character; // hack, needed to determine URL - TypeORM won't load banner.owner by itself
    }

    const freeCompany = await character.freeCompany;

    return {
      id: character.id,
      mine: !!user && character.user.id === user.id,
      name: character.name,
      race: character.race,
      server: character.server.name,
      avatar: character.avatar,
      lodestoneId: character.lodestoneId,
      active: character.active || false,
      appearance: character.appearance,
      background: character.background,
      occupation: character.occupation,
      age: character.age,
      birthplace: character.birthplace,
      residence: character.residence,
      title: character.title,
      nickname: character.nickname,
      pronouns: character.pronouns,
      motto: character.motto,
      friends: character.friends,
      relatives: character.relatives,
      enemies: character.enemies,
      loves: character.loves,
      hates: character.hates,
      motivation: character.motivation,
      carrdProfile: character.carrdProfile,
      banner: !banner ? null : new BannerDto({
        id: banner.id,
        url: this.imagesService.getUrl(banner),
        width: banner.width,
        height: banner.height
      }),
      showAvatar: character.showAvatar,
      showInfoboxes: character.showInfoboxes,
      combinedDescription: character.combinedDescription,
      freeCompany: !freeCompany ? null : {
        name: freeCompany.name,
        server: freeCompany.server.name
      },
      player: !character.user.publicPlayerProfile ? null : {
        id: character.user.id,
        name: character.user.playerName,
      },
      visibilityInPlayerProfile,
    };
  }

  async saveCharacter(characterDto: CharacterProfileDto, user: UserInfo): Promise<void> {
    const characterEntity = await this.connection.transaction(async em => {
			const repo = em.getRepository(Character);
			const character = await repo.findOne({
        where: {
          id: characterDto.id,
          user: {
            id: user.id,
          },
          verifiedAt: Not(IsNull())
        },
        relations: [ 'server' ]
      });

			if (!character) {
				throw new NotFoundException('Character not found');
			}

      const userEntity = (await em.getRepository(User).findOne({
        where: {
          id: user.id,
        },
        select: [ 'id', 'publicPlayerProfile' ],
      }))!; // Guaranteed to exist

			// TODO: Refactor
			Object.assign(character, {
				appearance: html.sanitize(characterDto.appearance),
				background: html.sanitize(characterDto.background),
				occupation: characterDto.occupation,
				age: characterDto.age,
				birthplace: characterDto.birthplace,
				residence: characterDto.residence,
				title: characterDto.title,
				nickname: characterDto.nickname,
        pronouns: characterDto.pronouns,
				motto: characterDto.motto,
        friends: characterDto.friends,
        relatives: characterDto.relatives,
        enemies: characterDto.enemies,
				loves: characterDto.loves,
				hates: characterDto.hates,
				motivation: characterDto.motivation,
        carrdProfile: checkCarrdProfile(characterDto.carrdProfile, user),
        showAvatar: characterDto.showAvatar,
        showInfoboxes: characterDto.showInfoboxes,
        combinedDescription: characterDto.combinedDescription,
			});

      if (characterDto.visibilityInPlayerProfile
          && characterDto.visibilityInPlayerProfile !== VisibilityInPlayerProfile.DISABLED) {
        if (!userEntity.publicPlayerProfile) {
          throw new BadRequestException('Your public player profile is disabled. Cannot set character visibility.');
        }

        character.showInPlayerProfile = characterDto.visibilityInPlayerProfile === VisibilityInPlayerProfile.SHOW;
      }

      if (characterDto.banner && characterDto.banner.id) {
        const banner = await em.getRepository(Image).findOne({
          where: {
            id: characterDto.banner.id,
            owner: {
              id: character.id,
            }
          }
        });

        if (!banner) {
          throw new BadRequestException('Banner not found');
        }

        if (banner.width / banner.height < SharedConstants.MIN_BANNER_ASPECT_RATIO) {
          throw new BadRequestException('Banner is too tall for its width');
        }

        character.banner = Promise.resolve(banner);
      } else {
        character.banner = Promise.resolve(null as unknown as Image);
      }

			return repo.save(character);
		});

    void this.eventEmitter.emitAsync('character.updated', characterEntity);
  }

  async getCharacterList(region: SiteRegion, filter: CharacterProfileFilterDto): Promise<PagingResultDto<CharacterSummaryDto>> {
		const query = this.characterRepo.createQueryBuilder('character')
			.where('character.verifiedAt IS NOT NULL')
			.orderBy('character.name', 'ASC')
			.innerJoinAndSelect('character.server', 'server')
			.select([ 'character.name', 'character.occupation', 'character.race', 'character.avatar', 'server.name' ]);

    if (region !== SiteRegion.GLOBAL) {
      query.andWhere('server.region = :region', { region });
    }

    if (filter.searchQuery) {
      query.andWhere(`(character.name LIKE :searchQuery OR character.occupation LIKE :searchQuery)`,
        { searchQuery:  `%${escapeForLike(filter.searchQuery)}%` });
    }

    if (filter.race) {
      query.andWhere('character.race = :race', { race: filter.race });
    }

    if (filter.freeCompanyId) {
      query.andWhere('character.freeCompany.id = :freeCompanyId', { freeCompanyId: filter.freeCompanyId });
    }

    if (filter.communityId) {
      andWhereExists(query, this.communityMembershipRepo.createQueryBuilder('membership')
        .innerJoinAndSelect('membership.character', 'mch')
        .innerJoinAndSelect('membership.community', 'mcm')
        .where('mch.id = character.id')
        .andWhere('mcm.id = :communityId', { communityId: filter.communityId })
        .andWhere('membership.status = :membershipStatus', { membershipStatus: MembershipStatus.CONFIRMED })
        .select('1'));
    }

    const total = await query.getCount();

    if (filter.offset) {
      query.offset(filter.offset);
    }

    if (filter.limit) {
      query.limit(filter.limit);
    }

    const characters = await query.getMany();

		return {
      total,
      data: characters.map(character => ({
				name: character.name,
        occupation: character.occupation,
				race: character.race,
				avatar: character.avatar,
				server: character.server.name,
			}))
    };
	}

  async refreshCharacter(characterId: IdWrapper, user: UserInfo): Promise<CharacterRefreshResultDto> {
    // Note that we intentionally don't check if the character is verified.
    // It is safe to update the Lodestone info of unverified characters,
    // though unverified users cannot access this API via the website.
		const characterEntity = await this.connection.transaction(async em => {
			const repo = em.getRepository(Character);
			const character = await repo.findOneBy({
        id: characterId.id,
        user: {
          id: user.id,
        },
			});

			if (!character) {
				throw new NotFoundException('Character not found');
			}

      if (!character.active) {
        throw new ConflictException('You cannot refresh inactive characters from Lodestone');
      }

      const lodestoneInfo = await this.lodestoneService.getCharacter(character.lodestoneId);

      if (!lodestoneInfo) {
        throw new GoneException('Character not found on Lodestone');
      }

      const server = await em.getRepository(Server).findOne({
        where: {
          name: lodestoneInfo.World,
        },
        select: [ 'id', 'name' ]
      });

      if (!server) {
        throw new NotFoundException(`Unknown server: ${lodestoneInfo.World}`);
      }

      // Info parsed from Lodestone - update it in database
			Object.assign(character, {
        name: lodestoneInfo.Name,
        race: getRaceByName(lodestoneInfo.Race),
        avatar: lodestoneInfo.Avatar,
				server,
			});

      try {
			  await repo.save(character);
      } catch (e) {
        if (isQueryFailedError(e) && e.code === 'ER_DUP_ENTRY') {
          throw new ConflictException(`Cannot update character name to ${character.name} (${server.name}), as that character is already registered. if the destination character has been renamed, update it first.`);
        }
      }

      // But that's not all! We need to invalidate the session cache, since character data is cached there.
      await this.publicAuthService.notifyUserChanged(user.id);

      return character;
		});

    void this.eventEmitter.emitAsync('character.updated', characterEntity);

    return {
      name: characterEntity.name,
      race: characterEntity.race,
      avatar: characterEntity.avatar,
      server: characterEntity.server.name
    };
	}

  async addAccountCharacter(request: AddCharacterRequestDto, user: UserInfo, region: SiteRegion): Promise<SessionCharacterDto> {
    try {
      const result = await this.connection.transaction(async em => {
        const userEntity = await em.getRepository(User).findOne({
          where: {
            id: user.id,
          },
          select: [ 'id' ]
        });

        if (!userEntity) {
          throw new ConflictException();
        }

        const character = await this.saveCharacterForUser(em, userEntity, request.lodestoneId, region);

        return {
          id: character.id,
          name: character.name,
          server: character.server.name,
          region: character.server.region,
          avatar: character.avatar,
          lodestoneId: character.lodestoneId,
          race: character.race,
          newsRole: character.newsRole,
          newsPseudonym: character.newsPseudonym,
          verified: false
        };
      });

      await this.publicAuthService.notifyUserChanged(user.id);
      return result;
    } catch (e) {
      if (isQueryFailedError(e)) {
        if (e.code === 'ER_DUP_ENTRY') {
          throw new ConflictException('This character has already been registered');
        }
      }

      // default
      throw e;
    }
  }

  // Utility methods


  // Also used in UserService
  async saveCharacterForUser(em: EntityManager, user: User, lodestoneId: number, region: SiteRegion): Promise<Character> {
    const characterRepo = em.getRepository(Character);
    const otherCharacter = await characterRepo.findOne({
      where: {
        lodestoneId,
        active: true,
      },
      relations: [ 'user' ],
      select: [ 'id', 'name', 'user' ]
    });

    if (otherCharacter && otherCharacter.user.id !== user.id) {
        throw new ConflictException('This character is already claimed by another user');
    }

    const characterInfo = await this.lodestoneService.getCharacter(lodestoneId);

    if (!characterInfo) {
      throw new BadRequestException('Invalid character');
    }

    if (otherCharacter && otherCharacter.name === characterInfo.Name) {
      throw new BadRequestException(
        'You have already registered this character. To update their Lodestone info, ' +
        'use the "Refresh from Lodestone" button in the character profile editor instead.');
    }

    // If we get here, either the Lodestone ID isn't registered yet,
    // or it is, but the character has a different name (indicating a name change).
    // We allow this: the user can make a new character profile for the new name.

    const server = await em.getRepository(Server).findOneBy({
      name: characterInfo.World,
    });

    if (!server) {
      throw new BadRequestException('Unknown world server');
    }

    if (region !== SiteRegion.GLOBAL && server.region !== region as string) {
      throw new BadRequestException(`This character is from the wrong region (expected: ${region}, got: ${server.region})`);
    }

    const race = getRaceByName(characterInfo.Race);

    if (!race) {
      throw new BadRequestException('Invalid race');
    }

    // Set all previously existing characters with this Lodestone ID as inactive
    await characterRepo.update({
      lodestoneId,
      user: {
        id: user.id,
      },
      active: true,
    }, {
      active: null
    });

    return characterRepo.save({
      lodestoneId,
      name: characterInfo.Name,
      race,
      server,
      user,
      avatar: characterInfo.Avatar,
      verificationCode: generateVerificationCode(),
      active: true
    });
  }

  async getRegistrationStatus(name: string, lodestoneId: number, user?: UserInfo): Promise<CharacterRegistrationStatusResultDto> {
    const existingCharacter = await this.characterRepo.findOne({
      where: {
        lodestoneId,
        active: true,
      },
      relations: [ 'user' ],
      select: [ 'id', 'name', 'user' ]
    });

    let status: CharacterRegistrationStatus;

    if (!existingCharacter) {
      status = CharacterRegistrationStatus.UNCLAIMED;
    } else if (!user || existingCharacter.user.id !== user.id) {
      status = CharacterRegistrationStatus.CLAIMED_BY_ANOTHER_USER;
    } else if (existingCharacter.name !== name) {
      status = CharacterRegistrationStatus.RENAMED;
    } else {
      status = CharacterRegistrationStatus.ALREADY_REGISTERED;
    }

    return { status };
  }
}
