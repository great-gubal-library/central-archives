import { HttpModule, Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [
    HttpModule,   
  ],
  controllers: [EventsController],
  providers: [EventsService]
})
export class EventsModule {

}
