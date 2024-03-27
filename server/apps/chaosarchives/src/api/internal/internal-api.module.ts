import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { CarrdModule } from './carrd/carrd.module';
import { CharactersModule } from './characters/characters.module';
import { CommunitiesModule } from './communities/communities.module';
import { EventsModule } from './events/events.module';
import { FreeCompaniesModule } from './free-companies/free-companies.module';
import { ImagesModule } from './images/images.module';
import { LinksModule } from './links/links.module';
import { MainPageModule } from './mainpage/main-page.module';
import { NewsModule } from "./news/news.module";
import { NoticeboardModule } from './noticeboard/noticeboard.module';
import { SearchModule } from './search/search.module';
import { ServersModule } from "./servers/servers.module";
import { StatisticsModule } from "./statistics/statistics.module";
import { StoriesModule } from './stories/stories.module';
import { UserModule } from './user/user.module';
import { VenuesModule } from './venues/venues.module';
import { ViolationsModule } from './violations/violations.module';
import { WikiModule } from "./wiki/wiki.module";
import { PlayerProfilesModule } from "./player-profiles/player-profiles.module";
import { LodestoneModule } from "./lodestone/lodestone.module";
import { HsspModule } from "./hssp/hssp.module";
import { OAuthModule } from "./oauth/oauth.module";

const controllerModules = [
	MainPageModule,
	EventsModule,
	UserModule,
	CharactersModule,
	CarrdModule,
	StoriesModule,
	ImagesModule,
	NewsModule,
	NoticeboardModule,
	CommunitiesModule,
	FreeCompaniesModule,
	VenuesModule,
	LinksModule,
	ViolationsModule,
	SearchModule,
	ServersModule,
	StatisticsModule,
	WikiModule,
	PlayerProfilesModule,
  LodestoneModule,
  HsspModule,
  OAuthModule,
];

@Module({
	imports: [
    ...controllerModules,
		RouterModule.register(controllerModules.map(module => ({
			path: 'internal',
			module,
		}))),
	],
})
export class InternalApiModule {}
