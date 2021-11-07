import { Character } from '@app/entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ImagesModule } from '../images/images.module';
import { StoriesModule } from '../stories/stories.module';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character]),
    StoriesModule,
    ImagesModule,
    AuthModule,
  ],
  controllers: [CharactersController],
  providers: [CharactersService],
  exports: [CharactersService],
})
export class CharactersModule {}
