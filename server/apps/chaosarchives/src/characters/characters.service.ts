import { Character } from '@app/entity';
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { Role } from '@app/shared/enums/role.enum';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import sanitizeHtml from 'sanitize-html';
import { Connection, IsNull, Not, Repository } from 'typeorm';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserInfo } from '../auth/user-info';

@Injectable()
export class CharactersService {
  constructor(
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
    };
  }

  async saveCharacter(character: CharacterProfileDto, user: UserInfo): Promise<void> {
		// TODO: Refactor
		if (user.role === Role.UNVERIFIED) {
			throw new ForbiddenException();
		}

    console.log(character);

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
				appearance: sanitizeHtml(character.appearance),
				background: sanitizeHtml(character.background),
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
			});

			await repo.save(characterEntity);
		});
  }
}
