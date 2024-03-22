import { Character, CommunityMembership, Event, NoticeboardItem, Story, User, WikiPage } from '@app/entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from '@app/authorization/authorization.module';
import { ImagesModule } from '../images/images.module';
import { StoriesModule } from '../stories/stories.module';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { MyContentService } from './my-content.service';
import { LodestoneModule } from '../lodestone/lodestone.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, CommunityMembership, Event, NoticeboardItem, Story, User, WikiPage]),
    StoriesModule,
    ImagesModule,
    AuthorizationModule,
    LodestoneModule,
  ],
  controllers: [CharactersController],
  providers: [CharactersService, MyContentService],
  exports: [CharactersService],
})
export class CharactersModule {}
