import { UserInfo } from '@app/auth/model/user-info';
import { Character } from '@app/entity';
import { RppCharacterProfileDto } from '@app/shared/dto/rpp/rpp-character-profile.dto';
import { races } from '@app/shared/enums/race.enum';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import utils from '../../common/utils';

@Injectable()
export class RppService {
  constructor(
    @InjectRepository(Character) private characterRepo: Repository<Character>,
    private connection: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  async getCharacterProfile(name: string, server: string, sessionToken: string): Promise<RppCharacterProfileDto> {
    if (sessionToken) {
      void this.eventEmitter.emitAsync('rpp.subscribed', {
        name,
        server,
        sessionToken
      });
    }

    const character = await this.characterRepo
      .createQueryBuilder('character')
      .innerJoinAndSelect('character.server', 'server')
      .where('character.verifiedAt IS NOT NULL')
      .andWhere('character.name = :name', { name })
      .andWhere('server.name = :server', { server })
      .select(['character'])
      .getOne();

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return {
      appearance: utils.htmlToText(character.appearance),
      background: character.combinedDescription ? '' : utils.htmlToText(character.background),
      occupation: character.occupation,
      race: races[character.race],
      age: character.age,
      birthplace: character.birthplace,
      residence: character.residence,
      title: character.title,
      nickname: character.nickname,
      motto: character.motto,
      friends: character.friends,
      relatives: character.relatives,
      enemies: character.enemies,
      loves: character.loves,
      hates: character.hates,
      motivation: character.motivation,
      currently: character.currently,
      oocInfo: character.oocInfo,
      pronouns: character.pronouns,
    };
  }

  async updateCharacterProfile(
    name: string,
    server: string,
    profile: RppCharacterProfileDto,
    user: UserInfo,
  ): Promise<void> {
		const characterEntity = await this.connection.transaction(async em => {
			const characterRepo = em.getRepository(Character);
			const character = await characterRepo
				.createQueryBuilder('character')
				.innerJoinAndSelect('character.server', 'server')
				.where('character.verifiedAt IS NOT NULL')
				.andWhere('character.name = :name', { name })
				.andWhere('server.name = :server', { server })
				.select(['character', 'server.name'])
				.getOne();

			if (!character) {
				throw new NotFoundException('Character not found');
			}

			if (!user.characters.some(ch => ch.id === character.id)) {
				throw new ForbiddenException('This is not your character');
			}

			Object.assign(character, {
				occupation: profile.occupation,
				age: profile.age,
				birthplace: profile.birthplace,
				residence: profile.residence,
				title: profile.title,
				nickname: profile.nickname,
        friends: profile.friends,
        relatives: profile.relatives,
        enemies: profile.enemies,
				loves: profile.loves,
				hates: profile.hates,
				motto: profile.motto,
				motivation: profile.motivation,
				currently: profile.currently,
				oocInfo: profile.oocInfo,
				pronouns: profile.pronouns,
			});

      if (typeof profile.nationality === 'string') {
        // Only change if explicitly passed
        character.nationality = profile.nationality;
      }

			return characterRepo.save(character);
		});

    void this.eventEmitter.emitAsync('character.updated', characterEntity);
	}
}
