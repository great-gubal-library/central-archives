import { Character } from "@app/entity";
import { RppCharacterProfileDto } from "@app/shared/dto/rpp/rpp-character-profile.dto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class RppService {
	constructor(@InjectRepository(Character) private characterRepo: Repository<Character>) {}

	async getCharacterProfile(
    name: string,
    server: string,
  ): Promise<RppCharacterProfileDto> {
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

		// temp; will use a new table for RPP profiles specifically
		return {
			appearance: character.appearance,
      background: character.combinedDescription ? '' : character.background,
      occupation: character.occupation,
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
		};
	}
}