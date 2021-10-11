import { Character } from '@app/entity';
import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { StoriesModule } from '../stories/stories.module';
import { MainPageController } from './main-page.controller';
import { MainPageService } from './main-page.service';
import { NewsService } from './news.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character]),
    StoriesModule,
    ImagesModule,
    HttpModule,   
  ],
  controllers: [MainPageController],
  providers: [MainPageService, NewsService],
})
export class MainPageModule {

}
