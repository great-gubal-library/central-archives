import { LinkResultDto } from "../links/link-result.dto";

export interface SearchResultDto extends Omit<LinkResultDto, 'type'> {
	content: string;
}
