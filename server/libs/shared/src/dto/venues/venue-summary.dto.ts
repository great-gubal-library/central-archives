import { HousingArea } from "@app/shared/enums/housing-area.enum";

export interface VenueSummaryDto {
	id: number;
	name: string;
	server: string;
	address: string;
	housingArea: HousingArea|null;
	purpose: string;
}
