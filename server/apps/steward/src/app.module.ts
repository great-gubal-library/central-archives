import { dbConfiguration } from "@app/configuration";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BotModule } from "./bot/bot.module";
import { WebhookModule } from "./webhook/webhook.module";

@Module({
	imports: [
		TypeOrmModule.forRootAsync({ useFactory: () => dbConfiguration }),
		BotModule,
		WebhookModule,
	],
})
export class AppModule { }
