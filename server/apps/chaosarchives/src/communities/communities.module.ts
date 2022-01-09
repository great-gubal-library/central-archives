import { Character } from '@app/entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character]),
  ],
  controllers: [CommunitiesController],
  providers: [CommunitiesService]
})
export class CommunitiesModule {}
