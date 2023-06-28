import { Character, CommunityMembership, Event, NoticeboardItem, Story, User, WikiPage } from '@app/entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@app/auth/auth.module';
import { ImagesModule } from '../images/images.module';
import { StoriesModule } from '../stories/stories.module';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { MyContentService } from './my-content.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, CommunityMembership, Event, NoticeboardItem, Story, User, WikiPage]),
    StoriesModule,
    ImagesModule,
    AuthModule,
  ],
  controllers: [CharactersController],
  providers: [CharactersService, MyContentService],
  exports: [CharactersService],
})
export class CharactersModule {}
