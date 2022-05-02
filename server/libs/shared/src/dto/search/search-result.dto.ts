import { BaseLinkResultDto } from "../common/base-link-result.dto";

export interface SearchResultDto extends BaseLinkResultDto {
	content: string;
	updatedAt: number;
}
