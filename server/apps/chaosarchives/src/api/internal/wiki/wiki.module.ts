import { Character, WikiPage } from '@app/entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WikiController } from './wiki.controller';
import { WikiService } from './wiki.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, WikiPage]),
  ],
  controllers: [WikiController],
  providers: [WikiService],
})
export class WikiModule {}
