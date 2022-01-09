import { FreeCompany } from '@app/entity';
import { FreeCompanySummaryDto } from '@app/shared/dto/fcs/free-company-summary.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FreeCompaniesService {
	constructor(
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
}
