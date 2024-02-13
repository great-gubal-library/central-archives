import { Region } from "@app/shared/enums/region.enum";

export interface DatacenterDto {
	name: string;
  region: Region;
	servers: string[];
}
