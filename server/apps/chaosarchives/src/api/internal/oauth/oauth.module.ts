import { Image, OAuthApp } from '@app/entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { OAuthAppController } from './apps/oauth-app.controller';
import { OAuthAppService } from './apps/oauth-app.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OAuthApp,
      Image,
    ]),
    ImagesModule,
  ],
  controllers: [OAuthAppController],
  providers: [OAuthAppService]
})
export class OAuthModule {}
