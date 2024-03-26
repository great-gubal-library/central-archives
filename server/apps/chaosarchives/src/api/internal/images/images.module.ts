import { Character, Image } from '@app/entity';
import SharedConstants from '@app/shared/shared-constants';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from '@app/authorization/authorization.module';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { StorageService } from './storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, Image]),
    MulterModule.registerAsync({
      useFactory: () => ({
        limits: {
          fileSize: SharedConstants.MAX_UPLOAD_SIZE,
        },
      }),
    }),
    AuthorizationModule,
  ],
  controllers: [ImagesController],
  providers: [ImagesService, StorageService],
  exports: [ImagesService]
})
export class ImagesModule {}
