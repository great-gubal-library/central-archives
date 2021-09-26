import { dbConfiguration, redisConfiguration } from '@app/configuration';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { MainPageModule } from './mainpage/main-page.module';
import { CharactersModule } from './characters/characters.module';
import { CarrdModule } from './carrd/carrd.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
