import { AuthorizationModule } from "@app/authorization/authorization.module";
import { Character, Image, Story } from "@app/entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FeedService } from "./feed.service";
import { FeedController } from "./feed.controller";
import { ImagesService } from "../internal/images/images.service";
import { StorageService } from "../internal/images/storage.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([ Character, Image, Story ]),
    AuthorizationModule,
	],
	controllers: [ FeedController ],
	providers: [ FeedService, ImagesService, StorageService ],
})
export class FeedModule { }
