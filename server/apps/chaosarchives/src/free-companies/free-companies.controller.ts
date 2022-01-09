import { FreeCompanySummaryDto } from '@app/shared/dto/fcs/free-company-summary.dto';
import { Controller, Get } from '@nestjs/common';
import { FreeCompaniesService } from './free-companies.service';

@Controller('free-companies')
export class FreeCompaniesController {
	constructor(
		private freeCompaniesService: FreeCompaniesService,
	) {}

	@Get()
	async getFreeCompanies(): Promise<FreeCompanySummaryDto[]> {
		return this.freeCompaniesService.getFreeCompanies();
	}
}
