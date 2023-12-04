import { Character, FreeCompany } from '@app/entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { FreeCompaniesController } from './free-companies.controller';
import { FreeCompaniesService } from './free-companies.service';
import { LodestoneModule } from '../lodestone/lodestone.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FreeCompany, Character]),
    ImagesModule,
    LodestoneModule,
  ],
  controllers: [FreeCompaniesController],
  providers: [FreeCompaniesService]
})
export class FreeCompaniesModule {

}
