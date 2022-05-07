import { SearchResultsDto } from '@app/shared/dto/search/search-results.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
	constructor(private searchService: SearchService) {}

	@Get()
	async search(@Query('q') query: string): Promise<SearchResultsDto[]> {
		return this.searchService.search(query);
	}
}
