import { Character, User } from '@app/entity';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from '@app/authorization/authorization.module';
import { CharactersModule } from '../characters/characters.module';
import { MailModule } from '../../../mail/mail.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LodestoneModule } from '../lodestone/lodestone.module';
import { User2FAService } from './user-2fa.service';
import { AuthenticationModule } from '@app/authentication/authentication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Character]),
    HttpModule,
    MailModule,
    AuthenticationModule,
    AuthorizationModule,
    CharactersModule,
    LodestoneModule,
  ],
  controllers: [UserController],
  providers: [UserService, User2FAService],
})
export class UserModule {}
