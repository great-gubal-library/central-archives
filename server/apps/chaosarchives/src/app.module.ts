import { dbConfiguration, redisConfiguration } from '@app/configuration';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NewsModule } from './news/news.module';
import { EventsModule } from './events/events.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: () => dbConfiguration }),
    RedisModule.forRootAsync({ useFactory: () => ({ config: redisConfiguration }) }),
    NewsModule,
    EventsModule,
    UserModule,
    MailModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
