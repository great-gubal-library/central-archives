import { Injectable, Logger } from "@nestjs/common";
import { DiscordClientProvider, Once } from "discord-nestjs";

@Injectable()
export class BotGateway {
	private readonly logger = new Logger(BotGateway.name);

  constructor(private readonly discordProvider: DiscordClientProvider) {}

	@Once({ event: 'ready' })
  async onReady(): Promise<void> {
		const client = this.discordProvider.getClient();

    this.logger.log(
      `Logged in as ${client.user!.tag}`,
    );

		// const channel = await client.channels.fetch('[ID]');
		// (channel as TextChannel).send('Hello Discord World!');
  }
}
