import { Character, NoticeboardItem } from '@app/entity';
import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeboardController } from './noticeboard.controller';
import { NoticeboardService } from './noticeboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, NoticeboardItem]),
    HttpModule,
  ],
  controllers: [NoticeboardController],
  providers: [NoticeboardService],
  exports: [NoticeboardService],
})
export class NoticeboardModule {}
