import { Character } from '@app/entity';
import { FreeCompany } from '@app/entity/free-company.entity';
import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { NoticeboardModule } from '../noticeboard/noticeboard.module';
import { StoriesModule } from '../stories/stories.module';
import { DailyMoogleService } from './daily-moogle.service';
import { LimsaInsiderService } from './limsa-insider.service';
import { MainPageController } from './main-page.controller';
import { MainPageService } from './main-page.service';
import { NewsService } from './news.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, FreeCompany]),
    StoriesModule,
    ImagesModule,
    NoticeboardModule,
    HttpModule,
  ],
  controllers: [MainPageController],
  providers: [MainPageService, NewsService, DailyMoogleService, LimsaInsiderService],
})
export class MainPageModule {}
