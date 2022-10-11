import { Module } from "@nestjs/common";
import { UpdatesGateway } from "./updates.gateway";

@Module({
	providers: [ UpdatesGateway ]
})
export class UpdatesModule {
	
}
