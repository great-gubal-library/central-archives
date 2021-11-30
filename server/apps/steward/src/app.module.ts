import { Module } from "@nestjs/common";
import { BotModule } from "./bot/bot.module";
import { WebhookModule } from "./webhook/webhook.module";

@Module({
	imports: [
		BotModule,
		WebhookModule,
	],
})
export class AppModule { }
