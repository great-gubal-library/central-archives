import { Character } from '@app/entity';
import { FreeCompany } from '@app/entity/free-company.entity';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunitiesModule } from '../communities/communities.module';
import { ImagesModule } from '../images/images.module';
import { NoticeboardModule } from '../noticeboard/noticeboard.module';
import { StoriesModule } from '../stories/stories.module';
import { VenuesModule } from '../venues/venues.module';
import { LimsaInsiderService } from './limsa-insider.service';
import { MainPageController } from './main-page.controller';
import { MainPageService } from './main-page.service';
import { NewsService } from './news.service';
import { NewsModule } from '../news/news.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, FreeCompany]),
    StoriesModule,
    ImagesModule,
    NewsModule,
    NoticeboardModule,
    CommunitiesModule,
    VenuesModule,
    HttpModule,
  ],
  controllers: [MainPageController],
  providers: [MainPageService, NewsService, LimsaInsiderService],
})
export class MainPageModule {}
