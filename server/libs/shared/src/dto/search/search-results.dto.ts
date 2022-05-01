import { PageType } from "@app/shared/enums/page-type.enum";
import { SearchResultDto } from "./search-result.dto";

export interface SearchResultsDto {
	type: PageType;
	results: SearchResultDto[];
}
