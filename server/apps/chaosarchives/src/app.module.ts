import { AuthModule } from '@app/auth/auth.module';
import { dbConfiguration, redisConfiguration } from '@app/configuration';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalApiModule } from './api/internal/internal-api.module';
import { RppModule } from './api/rpp/rpp.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalExceptionsFilter } from './global-exceptions.filter';
import { MailModule } from './mail/mail.module';
import { EventsModule } from './websocket/events/events.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: () => dbConfiguration }),
    RedisModule.forRootAsync({ useFactory: () => ({ config: redisConfiguration }) }),
    MailModule,
    AuthModule,
    InternalApiModule,
    RppModule,
    EventsModule,
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
