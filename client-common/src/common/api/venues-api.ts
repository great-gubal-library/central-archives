import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { VenueSummaryDto } from '@app/shared/dto/venues/venue-summary.dto';
import { VenueDto } from '@app/shared/dto/venues/venue.dto';
import APITransport, { QueryParams } from './api-transport';
import { VenueFilterDto } from '@app/shared/dto/venues/venue-filter.dto';
import { PagingResultDto } from '@app/shared/dto/common/paging-result.dto';

export default class VenuesAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('venues');
  }

	async getVenues(filter?: VenueFilterDto): Promise<PagingResultDto<VenueSummaryDto>> {
		return this.transport.get<PagingResultDto<VenueSummaryDto>>('', filter as QueryParams);
	}

	async getVenue(id: number): Promise<VenueDto> {
		return this.transport.tokenGet<VenueDto>(`${id}`);
	}

	async getVenueByName(name: string, server: string): Promise<VenueDto> {
		return this.transport.tokenGet<VenueDto>(`${server}/${name}`);
	}

	async createVenue(venue: VenueDto): Promise<IdWrapper> {
		return this.transport.authPost<IdWrapper>('', venue);
	}

	async editVenue(venue: VenueDto): Promise<void> {
		await this.transport.authPut<void>(`${venue.id}`, venue);
	}

	async deleteVenue(id: number): Promise<void> {
		return this.transport.authDelete<void>(`${id}`);
	}
}
