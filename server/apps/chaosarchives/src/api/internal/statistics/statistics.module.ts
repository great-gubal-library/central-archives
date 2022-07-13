import { Character, Server } from "@app/entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StatisticsController } from "./statistics.controller";
import { StatisticsService } from "./statistics.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([ Character, Server ]),
	],
	controllers: [ StatisticsController ],
	providers: [ StatisticsService ],
})
export class StatisticsModule { }
