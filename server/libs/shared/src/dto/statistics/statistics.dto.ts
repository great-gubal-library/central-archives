import { RaceStatisticsItemDto } from "./race-statistics-item.dto";
import { StatisticsItemDto } from "./statistics-item.dto";

export interface StatisticsDto {
	races: RaceStatisticsItemDto[];
	seekerTribes: StatisticsItemDto[];
	servers: StatisticsItemDto[];
}
