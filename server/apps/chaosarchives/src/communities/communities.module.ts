import { Character } from '@app/entity';
import { CommunityMembership } from '@app/entity/community-membership.entity';
import { Community } from '@app/entity/community.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, Community, CommunityMembership]),
  ],
  controllers: [CommunitiesController],
  providers: [CommunitiesService]
})
export class CommunitiesModule {}
