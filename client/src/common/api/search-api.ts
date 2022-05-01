import { SearchResultsDto } from '@app/shared/dto/search/search-results.dto';
import APITransport from './api-transport';

export default class SearchAPI {
	private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('search');
  }

	async search(query: string): Promise<SearchResultsDto[]> {
		return this.transport.get('', { q: query });
	}
}
