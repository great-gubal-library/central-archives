import { SearchResultsDto } from '@app/shared/dto/search/search-results.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ClientRegion } from 'apps/chaosarchives/src/common/client-region.decorator';
import { SiteRegion } from '@app/shared/enums/region.enum';

@Controller('search')
export class SearchController {
	constructor(private searchService: SearchService) {}

	@Get()
	async search(@ClientRegion() region: SiteRegion, @Query('q') query: string): Promise<SearchResultsDto[]> {
		return this.searchService.search(region, query);
	}
}
