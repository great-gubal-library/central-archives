import { Character } from '@app/entity';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarrdController } from './carrd.controller';
import { CarrdService } from './carrd.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character]),
    HttpModule,
  ],
  providers: [CarrdService],
  controllers: [CarrdController]
})
export class CarrdModule {}
