import { Character } from '@app/entity';
import { RppCharacterProfileDto } from '@app/shared/dto/rpp/rpp-character-profile.dto';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { convert } from 'html-to-text';
import { races } from '@app/shared/enums/race.enum';
import { UserInfo } from '@app/auth/model/user-info';

@Injectable()
export class RppService {
  constructor(
    @InjectRepository(Character) private characterRepo: Repository<Character>,
    private connection: Connection,
  ) {}

  async getCharacterProfile(name: string, server: string): Promise<RppCharacterProfileDto> {
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
      appearance: this.htmlToText(character.appearance),
      background: character.combinedDescription ? '' : this.htmlToText(character.background),
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

  private htmlToText(html: string): string {
    return convert(html, {
      wordwrap: false,
      ignoreHref: true,
      ignoreImage: true,
    });
  }

  async updateCharacterProfile(
    name: string,
    server: string,
    profile: RppCharacterProfileDto,
    user: UserInfo,
  ): Promise<void> {
		await this.connection.transaction(async em => {
			const characterRepo = em.getRepository(Character);
			const character = await characterRepo
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

			await characterRepo.save(character);
		});
	}
}
