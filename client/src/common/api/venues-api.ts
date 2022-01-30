import { VenueSummaryDto } from '@app/shared/dto/venues/venue-summary.dto';
import APITransport from './api-transport';

export default class VenuesAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('venues');
  }

	async getVenues(): Promise<VenueSummaryDto[]> {
		return this.transport.get<VenueSummaryDto[]>('');
	}
}
