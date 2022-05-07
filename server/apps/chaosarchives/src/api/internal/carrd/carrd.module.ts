import { Character } from '@app/entity';
import { HttpModule, Module } from '@nestjs/common';
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
