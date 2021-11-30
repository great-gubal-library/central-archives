import { discordConfiguration } from "@app/configuration/discord.config";
import { Module } from "@nestjs/common";
import { DiscordModule, TransformPipe, ValidationPipe } from "discord-nestjs";
import { BotGateway } from "./bot.gateway";

@Module({
	imports: [
		DiscordModule.forRootAsync({
			useFactory: () => ({
				token: discordConfiguration.botToken,
				commandPrefix: '!',
				usePipes: [TransformPipe, ValidationPipe],
				intents: 'GUILD_MESSAGES',
			})
		})
	],
	providers: [ BotGateway ]
})
export class BotModule { }
