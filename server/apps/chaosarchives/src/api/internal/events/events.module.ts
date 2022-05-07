import { Event } from '@app/entity';
import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { ChocoboChronicleService } from './chocobo-chronicle.service';
import { CrescentMoonPublishingService } from './crescent-moon-publishing.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Event ]),
    HttpModule,
    ImagesModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, CrescentMoonPublishingService, ChocoboChronicleService]
})
export class EventsModule {

}