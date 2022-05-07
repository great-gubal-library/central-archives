import { AuthModule } from '@app/auth/auth.module';
import { dbConfiguration, redisConfiguration } from '@app/configuration';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarrdModule } from './api/internal/carrd/carrd.module';
import { CharactersModule } from './api/internal/characters/characters.module';
import { CommunitiesModule } from './api/internal/communities/communities.module';
import { EventsModule } from './api/internal/events/events.module';
import { FreeCompaniesModule } from './api/internal/free-companies/free-companies.module';
import { GlobalExceptionsFilter } from './global-exceptions.filter';
import { ImagesModule } from './api/internal/images/images.module';
import { MailModule } from './mail/mail.module';
import { MainPageModule } from './api/internal/mainpage/main-page.module';
import { NoticeboardModule } from './api/internal/noticeboard/noticeboard.module';
import { StoriesModule } from './api/internal/stories/stories.module';
import { UserModule } from './api/internal/user/user.module';
import { VenuesModule } from './api/internal/venues/venues.module';
import { LinksModule } from './api/internal/links/links.module';
import { ViolationsModule } from './api/internal/violations/violations.module';
import { SearchModule } from './api/internal/search/search.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: () => dbConfiguration }),
    RedisModule.forRootAsync({ useFactory: () => ({ config: redisConfiguration }) }),
    MainPageModule,
    EventsModule,
    UserModule,
    MailModule,
    AuthModule,
    CharactersModule,
    CarrdModule,
    StoriesModule,
    ImagesModule,
    NoticeboardModule,
    CommunitiesModule,
    FreeCompaniesModule,
    VenuesModule,
    LinksModule,
    ViolationsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionsFilter,
    }
  ],
})
export class AppModule {}
