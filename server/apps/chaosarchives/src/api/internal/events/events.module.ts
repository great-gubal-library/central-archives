import { Event } from '@app/entity';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { ChocoboChronicleService } from './chocobo-chronicle.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Event ]),
    HttpModule,
    ImagesModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, ChocoboChronicleService]
})
export class EventsModule {

}
