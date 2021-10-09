import { serverConfiguration } from '@app/configuration';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from '../auth/auth.module';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { StorageService } from './storage.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        limits: {
          fileSize: serverConfiguration.maxUploadSizeKiB * 1024,
        }
      }),
    }),
    AuthModule, 
  ],
  providers: [ImagesService, StorageService],
  controllers: [ImagesController]
})
export class ImagesModule {}
