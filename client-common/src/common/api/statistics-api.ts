import { StatisticsDto } from '@app/shared/dto/statistics/statistics.dto';
import APITransport from './api-transport';

export default class StatisticsAPI {
	private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('statistics');
  }

	async getStatistics(): Promise<StatisticsDto> {
		return this.transport.get('');
	}
}
