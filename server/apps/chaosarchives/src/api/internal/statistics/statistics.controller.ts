import { StatisticsDto } from "@app/shared/dto/statistics/statistics.dto";
import { Controller, Get } from "@nestjs/common";
import { StatisticsService } from "./statistics.service";

@Controller('statistics')
export class StatisticsController {
	constructor(private statisticsService: StatisticsService) {}

	@Get()
	async getStatistics(): Promise<StatisticsDto> {
		return this.statisticsService.getStatistics();
	}
}
