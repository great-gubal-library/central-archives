import { Server } from '@app/entity';
import { Region } from '@app/shared/enums/region.enum';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import parse from 'node-html-parser';
import { firstValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';

const STATUS_PAGE_URL = 'https://is.xivup.com/';

const REGIONS_BY_LABEL: { [k: string]: Region } = {
  'North America': Region.NA,
  Europe: Region.EU,
  Oceanian: Region.OC,
  Japan: Region.JP,
};

@Injectable()
export class ServerListUpdater {
  private readonly log = new Logger(ServerListUpdater.name);

  constructor(private dataSource: DataSource, private httpService: HttpService) {}

  @Cron('0 0 * * * ')
  async updateServerList(): Promise<void> {
    this.log.debug('Updating server list');

    const document = parse((await firstValueFrom(this.httpService.get(STATUS_PAGE_URL))).data);
    const serverRepo = this.dataSource.getRepository(Server);

    const knownServers: { name: string }[] = await serverRepo
      .createQueryBuilder('q')
      .select('q.name', 'name')
      .getRawMany();
    const knownServerNames = new Set<string>(knownServers.map((server) => server.name));

    const newServers: Server[] = [];

    document.querySelectorAll('.region').forEach((regionDiv) => {
      if (regionDiv.classList.contains('hide')) {
        return; // ignore
      }

      const region = REGIONS_BY_LABEL[regionDiv.querySelector('.regiontitle')!.textContent.trim()];

      if (region) {
        regionDiv.querySelectorAll('.dc').forEach((dcDiv) => {
          const datacenter = dcDiv.querySelector('.title')!.textContent.trim();

          if (datacenter) {
            dcDiv.querySelectorAll('.realmname').forEach((serverNameDiv) => {
              const serverName = serverNameDiv.textContent.trim();

              if (!knownServerNames.has(serverName)) {
                newServers.push(
                  serverRepo.create({
                    name: serverName,
                    datacenter,
                    region,
                  }),
                );
              }
            });
          }
        });
      }
    });

    await serverRepo.save(newServers);

    this.log.debug('Finished updating server list');
  }
}
