import { Character, Community, Event, FreeCompany, Image, NoticeboardItem, Story, Venue, WikiPage } from '@app/entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

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
      WikiPage,
      Image,
    ]),
    ImagesModule,
  ],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule {

}
