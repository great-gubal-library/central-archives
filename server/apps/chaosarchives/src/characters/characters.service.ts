import { Character, Server, User } from '@app/entity';
import { AddCharacterRequestDto } from '@app/shared/dto/characters/add-character-request.dto';
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { CharacterRefreshResultDto } from '@app/shared/dto/characters/character-refresh-result.dto';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { CharacterSummaryDto } from '@app/shared/dto/characters/character-summary.dto';
import { SessionCharacterDto } from '@app/shared/dto/user/session-character.dto';
import { getRaceById } from '@app/shared/enums/race.enum';
import html from '@app/shared/html';
import SharedConstants from '@app/shared/SharedConstants';
import { BadRequestException, ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, EntityManager, IsNull, Not, Repository } from 'typeorm';
import { CurrentUser } from '../auth/current-user.decorator';
import { PublicAuthService } from '../auth/public-auth.service';
import { UserInfo } from '../auth/user-info';
import { getLodestoneCharacter } from '../common/lodestone';
import { generateVerificationCode } from '../common/security';

@Injectable()
export class CharactersService {
  constructor(
    private publicAuthService: PublicAuthService,
    private connection: Connection,
    @InjectRepository(Character) private characterRepo: Repository<Character>,
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
      .where('character.verifiedAt IS NOT NULL')
      .andWhere('character.name = :name', { name })
      .andWhere('server.name = :server', { server })
      .select(['character', 'server.name', 'user.id'])
      .getOne();

    if (!character) {
      throw new NotFoundException('Character not found');
    }

		// TODO: Refactor
    return {
      id: character.id,
      mine: !!user && character.user.id === user.id,
      name: character.name,
      race: character.race,
      server: character.server.name,
      avatar: character.avatar,
      lodestoneId: character.lodestoneId,
      appearance: character.appearance,
      background: character.background,
      occupation: character.occupation,
      age: character.age,
      birthplace: character.birthplace,
      residence: character.residence,
      title: character.title,
      nickname: character.nickname,
      motto: character.motto,
      loves: character.loves,
      hates: character.hates,
      motivation: character.motivation,
      carrdProfile: character.carrdProfile,
      showAvatar: character.showAvatar,
      showInfoboxes: character.showInfoboxes,
      combinedDescription: character.combinedDescription,
    };
  }

  async saveCharacter(character: CharacterProfileDto, user: UserInfo): Promise<void> {
    await this.connection.transaction(async em => {
			const repo = em.getRepository(Character);
			const characterEntity = await repo.findOne({
				id: character.id,
				user: {
					id: user.id,
				},
				verifiedAt: Not(IsNull())
			});

			if (!characterEntity) {
				throw new NotFoundException('Character not found');
			}

			// TODO: Refactor
			Object.assign(characterEntity, {
				appearance: html.sanitize(character.appearance),
				background: html.sanitize(character.background),
				occupation: character.occupation,
				age: character.age,
				birthplace: character.birthplace,
				residence: character.residence,
				title: character.title,
				nickname: character.nickname,
				motto: character.motto,
				loves: character.loves,
				hates: character.hates,
				motivation: character.motivation,
        carrdProfile: character.carrdProfile,
        showAvatar: character.showAvatar,
        showInfoboxes: character.showInfoboxes,
        combinedDescription: character.combinedDescription,
			});

			await repo.save(characterEntity);
		});
  }

  async getCharacterList(): Promise<CharacterSummaryDto[]> {
		const characters = await this.characterRepo.createQueryBuilder('character')
			.where('character.verifiedAt IS NOT NULL')
			.orderBy('character.name', 'ASC')
			.innerJoinAndSelect('character.server', 'server')
			.select([ 'character.name', 'character.race', 'character.avatar', 'server.name' ])
			.getMany();

		return characters.map(character => ({
				name: character.name,
				race: character.race,
				avatar: character.avatar,
				server: character.server.name,
			}));
	}

  async refreshCharacter(characterId: IdWrapper, user: UserInfo): Promise<CharacterRefreshResultDto> {
    // Note that we intentionally don't check if the character is verified.
    // It is safe to update the Lodestone info of unverified characters,
    // though unverified users cannot access this API via the website.
		return this.connection.transaction(async em => {
			const repo = em.getRepository(Character);
			const characterEntity = await repo.findOne({
				id: characterId.id,
				user: {
					id: user.id,
				},
			});

			if (!characterEntity) {
				throw new NotFoundException('Character not found');
			}

      const lodestoneInfo = await getLodestoneCharacter(characterEntity.lodestoneId);

      if (!lodestoneInfo) {
        throw new GoneException('Character not found on Lodestone');
      }

      const server = await em.getRepository(Server).findOne({
        where: {
          name: lodestoneInfo.Character.Server,
        },
        select: [ 'id', 'name' ]
      });

      if (!server) {
        throw new NotFoundException(`Unknown server: ${lodestoneInfo.Character.Server}`);
      }

      // Info parsed from Lodestone - update it in database
			Object.assign(characterEntity, {
        name: lodestoneInfo.Character.Name,
        race: getRaceById(lodestoneInfo.Character.Race),
        avatar: lodestoneInfo.Character.Avatar,
				server,
			});

			await repo.save(characterEntity);

      // But that's not all! We need to invalidate the session cache, since character data is cached there.
      await this.publicAuthService.notifyUserChanged(user.id);

      return {
        name: characterEntity.name,
        race: characterEntity.race,
        avatar: characterEntity.avatar,
        server: server.name
      };
		});
	}
  
  async addAccountCharacter(request: AddCharacterRequestDto, user: UserInfo): Promise<SessionCharacterDto> {
    const result = this.connection.transaction(async em => {
      const userEntity = await em.getRepository(User).findOne(user.id, {
        select: [ 'id' ]
      });

      if (!userEntity) {
        throw new ConflictException();
      }

      const character = await this.saveCharacterForUser(em, userEntity, request.lodestoneId);

      return {
        id: character.id,
        name: character.name,
        server: character.server.name,
        avatar: character.avatar,
        lodestoneId: character.lodestoneId,
        race: character.race,
        verified: false
      };
    });

    await this.publicAuthService.notifyUserChanged(user.id);
    return result;
  }

  // Utility methods


  // Also used in UserService
  async saveCharacterForUser(em: EntityManager, user: User, lodestoneId: number): Promise<Character> {
    const characterInfo = await getLodestoneCharacter(lodestoneId);

    if (!characterInfo) {
      throw new BadRequestException('Invalid character');
    }

    if (characterInfo.Character.DC !== SharedConstants.DATACENTER) {
      throw new BadRequestException('This character is from the wrong datacenter');
    }

    const server = await em.getRepository(Server).findOne({
      name: characterInfo.Character.Server,
    });

    if (!server) {
      throw new BadRequestException('Invalid server');
    }

    const race = getRaceById(characterInfo.Character.Race);

    if (!race) {
      throw new BadRequestException('Invalid race');
    }

    return em.getRepository(Character).save({
      lodestoneId: characterInfo.Character.ID,
      name: characterInfo.Character.Name,
      race,
      server,
      user,
      avatar: characterInfo.Character.Avatar,
      verificationCode: generateVerificationCode(),
    });
  }
}
