import { Character } from '@app/entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character]),
    AuthModule,
  ],
  providers: [CharactersService],
  controllers: [CharactersController]
})
export class CharactersModule {}
