import { Server } from "@app/entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServersController } from "./servers.controller";
import { ServersService } from "./servers.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Server
		]),
	],
	controllers: [ ServersController ],
	providers: [ ServersService ],
})
export class ServersModule { }
