import { Module } from "@nestjs/common";
import { BotModule } from "../bot/bot.module";
import { WebhookController } from "./webhook.controller";

@Module({
	imports: [
		BotModule,
	],
	controllers: [ WebhookController ],
})
export class WebhookModule { }
