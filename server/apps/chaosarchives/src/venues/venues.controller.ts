import { VenueSummaryDto } from '@app/shared/dto/venues/venue-summary.dto';
import { Controller, Get } from '@nestjs/common';
import { VenuesService } from './venues.service';

@Controller('venues')
export class VenuesController {
	constructor(private venuesService: VenuesService) {}

	@Get()
	async getVenues(): Promise<VenueSummaryDto[]> {
		return this.venuesService.getVenues({});
	}
}
