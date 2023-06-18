import { discordConfiguration } from "@app/configuration/discord.config";
import { EventAnnouncement, EventLocation, NoticeboardItem } from "@app/entity";
import { ModalFieldsTransformPipe, ValidationPipe } from "@discord-nestjs/common";
import { DiscordModule } from "@discord-nestjs/core";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnnouncementService } from "./announcement.service";
import { BotGateway } from "./bot.gateway";

@Module({
	imports: [
		TypeOrmModule.forFeature([ EventAnnouncement, EventLocation, NoticeboardItem ]),
		DiscordModule.forRootAsync({
			useFactory: () => ({
				token: discordConfiguration.botToken,
				commandPrefix: '!',
				usePipes: [ModalFieldsTransformPipe, ValidationPipe],
				discordClientOptions: {
					intents: 'GuildMessages',
				}
			})
		})
	],
	providers: [ AnnouncementService, BotGateway ],
	exports: [ AnnouncementService ],
})
export class BotModule { }
