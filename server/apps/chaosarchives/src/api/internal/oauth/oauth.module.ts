import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import { OAuthAppService } from './oauth-app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image, OAuthApp } from '@app/entity';
import { ImagesModule } from '../images/images.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OAuthApp,
      Image,
    ]),
    ImagesModule,
  ],
  controllers: [OAuthController],
  providers: [OAuthAppService]
})
export class OAuthModule {}
