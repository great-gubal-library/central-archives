import { UserInfo } from '@app/auth/model/user-info';
import { Character, FreeCompany, Image } from '@app/entity';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { FreeCompanySummaryDto } from '@app/shared/dto/fcs/free-company-summary.dto';
import { FreeCompanyDto } from '@app/shared/dto/fcs/free-company.dto';
import SharedConstants from '@app/shared/SharedConstants';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';

@Injectable()
export class FreeCompaniesService {
	constructor(
    private imagesService: ImagesService,
		private connection: Connection,
		@InjectRepository(FreeCompany) private freeCompanyRepo: Repository<FreeCompany>,
	) {}

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
			fc.carrdProfile = fcDto.carrdProfile;

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
			name: fc.name,
			server: fc.server.name,
			tag: fc.tag,
			description: fc.description,
			goal: fc.goal,
			website: fc.website,
			crest: fc.getCrest(),
			lodestoneId: fc.lodestoneId,
			status: fc.status,
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
