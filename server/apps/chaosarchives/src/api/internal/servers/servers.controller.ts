import { DatacenterDto } from "@app/shared/dto/servers/datacenter-dto";
import { Controller, Get } from "@nestjs/common";
import { ServersService } from "./servers.service";

@Controller('servers')
export class ServersController {
	constructor(private serversService: ServersService) { }

	@Get('datacenters')
	async getDatacenters(): Promise<DatacenterDto[]> {
		return this.serversService.getDatacenters();
	}
}
