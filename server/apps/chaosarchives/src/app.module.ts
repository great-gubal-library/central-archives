import { AuthorizationModule } from '@app/authorization/authorization.module';
import { dbConfiguration, redisConfiguration } from '@app/configuration';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalApiModule } from './api/internal/internal-api.module';
import { RppModule } from './api/rpp/rpp.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalExceptionsFilter } from './global-exceptions.filter';
import { MailModule } from './mail/mail.module';
import { UpdatesModule } from './websocket/updates/updates.module';
import { FeedModule } from './api/feed/feed.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: () => dbConfiguration }),
    RedisModule.forRootAsync({ useFactory: () => ({ config: redisConfiguration }) }),
    EventEmitterModule.forRoot(),
    CronModule,
    MailModule,
    AuthorizationModule,
    InternalApiModule,
    RppModule,
    FeedModule,
    UpdatesModule,
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
