import { StatisticsDto } from "@app/shared/dto/statistics/statistics.dto";
import { Controller, Get } from "@nestjs/common";
import { StatisticsService } from "./statistics.service";
import { ClientRegion } from "apps/chaosarchives/src/common/client-region.decorator";
import { SiteRegion } from "@app/shared/enums/region.enum";

@Controller('statistics')
export class StatisticsController {
	constructor(private statisticsService: StatisticsService) {}

	@Get()
	async getStatistics(@ClientRegion() region: SiteRegion): Promise<StatisticsDto> {
		return this.statisticsService.getStatistics(region);
	}
}
