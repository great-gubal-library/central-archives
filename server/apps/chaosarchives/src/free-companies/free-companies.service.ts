import { UserInfo } from '@app/auth/model/user-info';
import { Character, FreeCompany, Image, Server } from '@app/entity';
import { CharacterIdWrapper } from '@app/shared/dto/common/character-id-wrapper.dto';
import { FreeCompanySummaryDto } from '@app/shared/dto/fcs/free-company-summary.dto';
import { FreeCompanyDto } from '@app/shared/dto/fcs/free-company.dto';
import { MyFreeCompanySummaryDto } from '@app/shared/dto/fcs/my-free-company-summary.dto';
import SharedConstants from '@app/shared/SharedConstants';
import { normalizeXivapiServerName } from '@app/shared/xivapi-utils';
import { BadRequestException, ConflictException, ForbiddenException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import XIVAPI from '@xivapi/js';
import { DateTime } from 'luxon';
import { Connection, IsNull, Not, Repository } from 'typeorm';
import { checkCarrdProfile } from '../common/api-checks';
import { getLodestoneCharacter } from '../common/lodestone';
import { ImagesService } from '../images/images.service';

@Injectable()
export class FreeCompaniesService {
	constructor(
    private imagesService: ImagesService,
		private connection: Connection,
		@InjectRepository(Character) private characterRepo: Repository<Character>,
		@InjectRepository(FreeCompany) private freeCompanyRepo: Repository<FreeCompany>,
	) {}

	async getMyFreeCompany(characterIdWrapper: CharacterIdWrapper, user: UserInfo): Promise<MyFreeCompanySummaryDto|null> {
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
		return !fc ? null : this.toFCSummaryDto(fc, characterIdWrapper.characterId);
	}
	
	async setFreeCompany(characterIdWrapper: CharacterIdWrapper, user: UserInfo): Promise<MyFreeCompanySummaryDto|null> {
		const characterInfo = user.characters.find(ch => ch.id === characterIdWrapper.characterId);
		
		if (!characterInfo) {
			throw new NotFoundException('Character not found');
		}

		const xivapi = new XIVAPI();
		const lodestoneCharacterInfo = await getLodestoneCharacter(characterInfo.lodestoneId);

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
				fc.foundedAt = DateTime.fromSeconds(fcLodestoneInfo.FreeCompany.Formed).toJSDate();
			} else {
				fc = existingFC;
			}

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
					name: normalizeXivapiServerName(fcLodestoneInfo.FreeCompany.Server)
				}
			});

			if (!server) {
				throw new ConflictException(`Unknown server: ${fcLodestoneInfo.FreeCompany.Server}`);
			}
			
			fc.server = server;
			fc.crest = fcLodestoneInfo.FreeCompany.Crest.join(',');
			await fcRepo.save(fc);

			character.freeCompany = Promise.resolve(fc);
			await characterRepo.save(character);
			return this.toFCSummaryDto(fc, characterIdWrapper.characterId);
		})
	}

	private toFCSummaryDto(fc: FreeCompany, characterId: number): MyFreeCompanySummaryDto {
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

	async unsetFreeCompany(characterIdWrapper: CharacterIdWrapper, user: UserInfo): Promise<void> {
		const characterInfo = user.characters.find(ch => ch.id === characterIdWrapper.characterId);
		
		if (!characterInfo) {
			throw new NotFoundException('Character not found');
		}

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

			character.freeCompany = Promise.resolve(null);
			await characterRepo.save(character);

			// If we're the leader, forget it
			await em.getRepository(FreeCompany).update({
				leader: {
					id: character.id
				}
			}, {
				leader: null,
				claimedAt: null as unknown as Date
			});
		});
	}

	async getFreeCompanies(): Promise<FreeCompanySummaryDto[]> {
		const fcs = await this.freeCompanyRepo.createQueryBuilder('fc')
			.where('fc.claimedAt IS NOT NULL')
			.orderBy('fc.name', 'ASC')
			.innerJoinAndSelect('fc.server', 'server')
			.select([ 'fc.id', 'fc.name', 'fc.crest', 'fc.goal', 'server.name' ])
			.getMany();

		return fcs.map(fc => ({
			name: fc.name,
			crest: fc.getCrest(),
			goal: fc.goal,
			server: fc.server.name,
		}));
	}

	async getFreeCompany(name: string, server: string, user?: UserInfo): Promise<FreeCompanyDto> {
		const fc = await this.freeCompanyRepo.findOne({
			where: {
				name,
				server: {
					name: server,
				}
			},
			relations: [ 'server', 'leader', 'banner', 'banner.owner' ]
		});

		if (!fc) {
			throw new NotFoundException('Free Company not found');
		}

		return this.toFreeCompanyDto(fc, user);
	}

	async editFreeCompany(fcDto: FreeCompanyDto, user: UserInfo): Promise<void> {
		await this.connection.transaction(async em => {
			const fcRepo = em.getRepository(FreeCompany);
			const fc = await fcRepo.findOne({
				where: {
					id: fcDto.id,
				},
				relations: [ 'server', 'leader', 'banner', 'banner.owner' ]
			});
	
			if (!fc) {
				throw new NotFoundException('Free Company not found');
			}

			if (!fc.leader || !user || !user.characters.some(ch => ch.id === fc.leader!.id)) {
				throw new ForbiddenException('Not your Free Company');
			}

			fc.description = fcDto.description;
			fc.goal = fcDto.goal;
			fc.website = fcDto.website;
			fc.status = fcDto.status;
			fc.areaOfOperations = fcDto.areaOfOperations;
			fc.recruitingOfficers = fcDto.recruitingOfficers;
			fc.carrdProfile = checkCarrdProfile(fcDto.carrdProfile, user);

			// Set banner
			if (fcDto.banner && fcDto.banner.id) {
        const banner = await em.getRepository(Image).findOne({
          where: {
            id: fcDto.banner.id,
            owner: fc.leader
          }
        });

        if (!banner) {
          throw new BadRequestException('Banner not found');
        }

        if (banner.width / banner.height < SharedConstants.MIN_BANNER_ASPECT_RATIO) {
          throw new BadRequestException('Banner is too tall for its width');
        }

        fc.banner = Promise.resolve(banner);
      } else {
        fc.banner = Promise.resolve(null);
      }

			await fcRepo.save(fc);
		});		
	}

	async toFreeCompanyDto(fc: FreeCompany, user?: UserInfo): Promise<FreeCompanyDto> {
		const banner = await fc.banner;

		return {
			id: fc.id,
			mine: !!fc.leader && !!user && user.characters.some(ch => ch.id === fc.leader!.id),
			claimed: !!fc.claimedAt,
			foundedAt: fc.foundedAt.getTime(),
			name: fc.name,
			server: fc.server.name,
			tag: fc.tag,
			description: fc.description,
			goal: fc.goal,
			website: fc.website,
			crest: fc.getCrest(),
			lodestoneId: fc.lodestoneId,
			status: fc.status,
			areaOfOperations: fc.areaOfOperations,
			recruitingOfficers: fc.recruitingOfficers,
			carrdProfile: fc.carrdProfile,
			banner: !banner ? null : {
				id: banner.id,
				url: this.imagesService.getUrl(banner),
				width: banner.width,
				height: banner.height,
			}
		}
	}
}
