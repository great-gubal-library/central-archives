import { UserInfo } from '@app/auth/model/user-info';
import { Character, FreeCompany, Server } from '@app/entity';
import { CharacterIdWrapper } from '@app/shared/dto/common/character-id-wrapper.dto';
import { CommunityFCSummaryDto } from '@app/shared/dto/communities/community-fc-summary.dto';
import { MyCommunitiesInfoDto } from '@app/shared/dto/communities/my-communities-info.dto';
import { ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import XIVAPI from '@xivapi/js';
import { DateTime } from 'luxon';
import { Connection, IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class CommunitiesService {
	constructor(
		private connection: Connection,
		@InjectRepository(Character) private characterRepo: Repository<Character>,
		) {}

	async getCommunitiesInfo(characterIdWrapper: CharacterIdWrapper, user: UserInfo): Promise<MyCommunitiesInfoDto> {
		const character = await this.characterRepo.findOne({
			where: {
				id: characterIdWrapper.characterId,
				user: {
					id: user.id,
				},
				verifiedAt: Not(IsNull())
			},
			relations: [ 'freeCompany', 'freeCompany.server', 'freeCompany.leader' ]
		});

		if (!character) {
			throw new NotFoundException('Character not found');
		}

		const fc = await character.freeCompany;

		return {
			freeCompany: !fc ? null : this.toFCSummaryDto(fc, characterIdWrapper.characterId)
		};
	}
	
	async setFreeCompany(characterIdWrapper: CharacterIdWrapper, user: UserInfo): Promise<CommunityFCSummaryDto|null> {
		const characterInfo = user.characters.find(ch => ch.id === characterIdWrapper.characterId);
		
		if (!characterInfo) {
			throw new NotFoundException('Character not found');
		}

		const xivapi = new XIVAPI();
		const lodestoneCharacterInfo = await xivapi.character.get(characterInfo.lodestoneId);

		if (!lodestoneCharacterInfo) {
			throw new GoneException('Character not found on Lodestone');
		}

		const fcLodestoneId = lodestoneCharacterInfo.Character.FreeCompanyId;
		const fcLodestoneInfo = !fcLodestoneId ? null : await xivapi.freecompany.get(fcLodestoneId, { data: 'FCM' });

		return this.connection.transaction(async em => {
			const characterRepo = em.getRepository(Character);
			const character = await characterRepo.findOne({
				where: {
					id: characterInfo.id,
					verifiedAt: Not(IsNull())
				}
			});

			if (!character) {
				throw new NotFoundException('Character not found');
			}

			if (!fcLodestoneId || !fcLodestoneInfo) {
				character.freeCompany = Promise.resolve(null);
				await characterRepo.save(character);
				return null;
			}

			const leaderLodestoneId = fcLodestoneInfo.FreeCompanyMembers[0].ID;

			let fc: FreeCompany;
			const fcRepo = em.getRepository(FreeCompany);
			const existingFC = await fcRepo.findOne({
				where: {
					lodestoneId: fcLodestoneId,
				},
				relations: ['leader', 'server']
			});

			if (!existingFC) {
				fc = new FreeCompany();
				fc.name = fcLodestoneInfo.FreeCompany.Name;
				fc.lodestoneId = fcLodestoneId;
				fc.tag = fcLodestoneInfo.FreeCompany.Tag;

				if (!fc.leader && characterInfo.lodestoneId === leaderLodestoneId) {
					if (!fc.claimedAt) {
						fc.claimedAt = new Date();
					}

					fc.leader = character;
				}

				const server = await em.getRepository(Server).findOne({
					where: {
						name: fcLodestoneInfo.FreeCompany.Server
					}
				});

				if (!server) {
					throw new ConflictException(`Unknown server: ${fcLodestoneInfo.FreeCompany.Server}`);
				}
				
				fc.crest = fcLodestoneInfo.FreeCompany.Crest.join(',');
				fc.server = server;
				fc.foundedAt = DateTime.fromSeconds(fcLodestoneInfo.FreeCompany.Formed).toJSDate();
				await fcRepo.save(fc);
			} else {
				fc = existingFC;

				if (!fc.leader && characterInfo.lodestoneId === leaderLodestoneId) {
					if (!fc.claimedAt) {
						fc.claimedAt = new Date();
					}

					fc.leader = character;
					await fcRepo.save(fc);
				}
			}

			character.freeCompany = Promise.resolve(fc);
			await characterRepo.save(character);
			return this.toFCSummaryDto(fc, characterIdWrapper.characterId);
		})
	}

	private toFCSummaryDto(fc: FreeCompany, characterId: number): CommunityFCSummaryDto {
		return {
			id: fc.id,
			name: fc.name,
			goal: fc.goal,
			tag: fc.tag,
			crest: fc.getCrest(),
			server: fc.server.name,
			isLeader: !!fc.leader && fc.leader.id === characterId,
		}
	}
}
