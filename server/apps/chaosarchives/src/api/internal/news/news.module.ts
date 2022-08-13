import { News, NewsIssue, Image } from "@app/entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesModule } from "../images/images.module";
import { NewsController } from "./news.controller";
import { NewsService } from "./news.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([ News, NewsIssue, Image ]),
		ImagesModule,
	],
	controllers: [ NewsController ],
	providers: [ NewsService ],
	exports: [ NewsService ],
})
export class NewsModule { }
