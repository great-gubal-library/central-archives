import { Character } from "@app/entity";
import { RppCharacterProfileDto } from "@app/shared/dto/rpp/rpp-character-profile.dto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { convert } from 'html-to-text';
import { races } from "@app/shared/enums/race.enum";

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

		// Strip wikilinks from all properties
		const properties = Object.keys(character) as (keyof Character)[];

		properties.forEach(property => {
			const value = character[property];

			if (typeof value === 'string') {
				(character[property] as string) = this.stripWikilinks(value);
			}
		});

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

	private stripWikilinks(html: string): string {
		return html.replace(/\[\[(.+?\|)?(.+?)\]\]/g, '$2');
	}

	private htmlToText(html: string): string {
		return convert(html, {
			wordwrap: false,
			ignoreHref: true,
			ignoreImage: true,
		});
	}
}