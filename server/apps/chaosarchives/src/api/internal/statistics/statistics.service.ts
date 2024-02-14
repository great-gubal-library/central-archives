import { Character } from '@app/entity';
import { RaceStatisticsItemDto } from '@app/shared/dto/statistics/race-statistics-item.dto';
import { StatisticsItemDto } from '@app/shared/dto/statistics/statistics-item.dto';
import { StatisticsDto } from '@app/shared/dto/statistics/statistics.dto';
import { Race } from '@app/shared/enums/race.enum';
import { SiteRegion } from '@app/shared/enums/region.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Character) private characterRepo: Repository<Character>,
  ) {}

  async getStatistics(region: SiteRegion): Promise<StatisticsDto> {
		const raceStatistics = await this.characterRepo.createQueryBuilder('c')
			.select('c.race', 'race')
			.addSelect('COUNT(c.id)', 'count')
      .innerJoinAndSelect('c.server', 's')
      .where(region === SiteRegion.GLOBAL ? '1 = 1' : 's.region = :region', { region })
			.groupBy('c.race')
			.orderBy('COUNT(c.id)', 'DESC')
			.addOrderBy('c.race', 'ASC')
			.getRawMany() as RaceStatisticsItemDto[];

		const seekerTribeStatistics = (await this.characterRepo.createQueryBuilder('c')
			.select('SUBSTRING(c.name, 1, 1)', 'tribeLetter')
			.addSelect('COUNT(c.id)', 'count')
      .innerJoinAndSelect('c.server', 's')
      .where(region === SiteRegion.GLOBAL ? '1 = 1' : 's.region = :region', { region })
			.andWhere('c.race = :race', { race: Race.MIQOTE })
			.andWhere('c.name LIKE :pattern', { pattern: "_'%" })
			.groupBy('tribeLetter')
			.orderBy('COUNT(c.id)', 'DESC')
			.addOrderBy('tribeLetter', 'ASC')
			.getRawMany() as { tribeLetter: string; count: number }[])
			.map(row => ({ name: row.tribeLetter, count: row.count }));

		const serverStatistics = await this.characterRepo.createQueryBuilder('c')
			.innerJoinAndSelect('c.server', 's')
      .where(region === SiteRegion.GLOBAL ? '1 = 1' : 's.region = :region', { region })
			.select('s.name', 'name')
			.addSelect('COUNT(c.id)', 'count')
			.groupBy('s.name')
			.orderBy('COUNT(c.id)', 'DESC')
			.addOrderBy('s.name', 'ASC')
			.getRawMany() as StatisticsItemDto[];

    return {
      races: raceStatistics,
      seekerTribes: seekerTribeStatistics,
      servers: serverStatistics,
    };
  }
}
