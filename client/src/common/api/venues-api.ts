import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { VenueSummaryDto } from '@app/shared/dto/venues/venue-summary.dto';
import { VenueDto } from '@app/shared/dto/venues/venue.dto';
import APITransport from './api-transport';

export default class VenuesAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('venues');
  }

	async getVenues(): Promise<VenueSummaryDto[]> {
		return this.transport.get<VenueSummaryDto[]>('');
	}

	async getVenue(id: number): Promise<VenueDto> {
		return this.transport.tokenGet<VenueDto>(`${id}`);
	}

	async createVenue(venue: VenueDto): Promise<IdWrapper> {
		return this.transport.authPost<IdWrapper>('', venue);
	}

	async editVenue(venue: VenueDto): Promise<void> {
		await this.transport.authPut<void>(`${venue.id}`, venue);
	}
}
