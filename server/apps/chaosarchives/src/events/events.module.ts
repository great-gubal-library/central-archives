import { HttpModule, Module } from '@nestjs/common';
import { ChocoboChronicleService } from './chocobo-chronicle.service';
import { CrescentMoonPublishingService } from './crescent-moon-publishing.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [
    HttpModule,   
  ],
  controllers: [EventsController],
  providers: [EventsService, CrescentMoonPublishingService, ChocoboChronicleService]
})
export class EventsModule {

}
