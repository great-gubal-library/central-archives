import { FreeCompanySummaryDto } from '@app/shared/dto/fcs/free-company-summary.dto';
import APITransport from './api-transport';

export default class FreeCompaniesAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('free-companies');
  }

	async getFreeCompanies(): Promise<FreeCompanySummaryDto[]> {
		return this.transport.get<FreeCompanySummaryDto[]>('');
	}
}
