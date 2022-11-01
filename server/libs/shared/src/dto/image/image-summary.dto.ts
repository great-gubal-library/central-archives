export interface ImageSummaryDto {
	id: number,
	url: string,
	thumbUrl: string,
	filename: string,
	title: string,
	owner: string|null,
	ownerServer: string|null,
	description: string|null,
	width: number,
	height: number,
	createdAt: number,
}
