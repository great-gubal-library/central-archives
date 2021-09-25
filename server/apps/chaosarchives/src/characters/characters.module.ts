import { Character } from '@app/entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character]),
  ],
  providers: [CharactersService],
  controllers: [CharactersController]
})
export class CharactersModule {}
