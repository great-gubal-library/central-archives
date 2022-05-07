import { Character, Community, Event, FreeCompany, Image, NoticeboardItem, Story, Venue } from '@app/entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Character,
      FreeCompany,
      Community,
      Venue,
      Event,
      Story,
      NoticeboardItem,
      Image,
    ]),
    ImagesModule,
  ],
  controllers: [LinksController],
  providers: [LinksService]
})
export class LinksModule {
  
}
