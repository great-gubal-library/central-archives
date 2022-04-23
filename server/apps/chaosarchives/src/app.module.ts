import { AuthModule } from '@app/auth/auth.module';
import { dbConfiguration, redisConfiguration } from '@app/configuration';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarrdModule } from './carrd/carrd.module';
import { CharactersModule } from './characters/characters.module';
import { CommunitiesModule } from './communities/communities.module';
import { EventsModule } from './events/events.module';
import { FreeCompaniesModule } from './free-companies/free-companies.module';
import { GlobalExceptionsFilter } from './global-exceptions.filter';
import { ImagesModule } from './images/images.module';
import { MailModule } from './mail/mail.module';
import { MainPageModule } from './mainpage/main-page.module';
import { NoticeboardModule } from './noticeboard/noticeboard.module';
import { StoriesModule } from './stories/stories.module';
import { UserModule } from './user/user.module';
import { VenuesModule } from './venues/venues.module';
import { LinksModule } from './links/links.module';
import { ViolationsModule } from './violations/violations.module';

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
