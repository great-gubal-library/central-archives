import { Server } from "@app/entity";
import { DatacenterDto } from "@app/shared/dto/servers/datacenter-dto";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ServersService {
	constructor(@InjectRepository(Server) private serverRepo: Repository<Server>) {}

	async getDatacenters(): Promise<DatacenterDto[]> {
		const servers = await this.serverRepo.find({
			order: {
				datacenter: 'ASC',
				name: 'ASC'
			}
		});

		let currentDC: DatacenterDto | null = null;
		const result: DatacenterDto[] = [];

		servers.forEach(server => {
			if (currentDC === null || server.datacenter !== currentDC.name) {
				currentDC = {
					name: server.datacenter,
					servers: [ server.name ]
				};
				
				result.push(currentDC);
			} else {
				currentDC.servers.push(server.name);
			}
		});

		return result;
	}
}
