import { Character } from '@app/entity';
import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MainPageController } from './main-page.controller';
import { MainPageService } from './main-page.service';
import { NewsService } from './news.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character]),
    HttpModule,   
  ],
  controllers: [MainPageController],
  providers: [MainPageService, NewsService],
})
export class MainPageModule {

}
