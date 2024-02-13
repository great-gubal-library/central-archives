import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ServerListUpdater } from "./server-list-updater";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  providers: [ ServerListUpdater ],
})
export class CronModule {

}
