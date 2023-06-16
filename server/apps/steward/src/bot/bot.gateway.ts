import { discordConfiguration } from "@app/configuration/discord.config";
import { Injectable, Logger } from "@nestjs/common";
import { DiscordClientProvider, Once } from "discord-nestjs";

@Injectable()
export class BotGateway {
	private readonly logger = new Logger(BotGateway.name);

	private ready = false;

  constructor(private readonly discordProvider: DiscordClientProvider) {}

	@Once({ event: 'ready' })
  async onReady(): Promise<void> {
		const client = this.discordProvider.getClient();
		this.logger.log(
      `Logged in as ${client.user!.tag}`,
    );
		this.ready = true;
  }

	async sendAnnouncement(message: string, datacenter: string): Promise<void> {
		return this.send(message, discordConfiguration.announcementChannels[datacenter]);
	}

	async sendNoticeboardItem(message: string): Promise<void> {
		return this.send(message, discordConfiguration.noticeboardChannel);
	}

	private async send(message: string, channelId: string): Promise<void> {
		if (!this.ready) {
			throw new Error('Discord bot still initializing');
		}

		const client = this.discordProvider.getClient();
		const [ channel, guild ] = await Promise.all([
			client.channels.fetch(channelId),
			client.guilds.fetch(discordConfiguration.serverId),
		]);

		if (!channel) {
			throw new Error('Channel not found');
		}

		if (!channel.isText()) {
			throw new Error('Cannot send messages to a non-text channel');
		}
		
		// Resolve users

		const usersToFind: string[] = [];
		let mention: RegExpExecArray|null = null;

		const regex1 = /@([A-Za-z0-9_-]+)#([0-9]+)/g;

		// eslint-disable-next-line no-cond-assign
		while ((mention = regex1.exec(message)) !== null) {
			usersToFind.push(mention[1]);
		}

		const regex2 = /@\{([^}]+)\}/g;

		// eslint-disable-next-line no-cond-assign
		while ((mention = regex2.exec(message)) !== null) {
			usersToFind.push(mention[1]);
		}

		await Promise.all(usersToFind.map(username => guild.members.search({
			query: username
		})));

		let replacedMessage = message;

		replacedMessage = replacedMessage.replace(regex1, (substring, username, discriminator) => {
			const members = guild.members.cache.filter(
				member => member.user.username === username && member.user.discriminator === discriminator);

			if (members.size === 1) {
				return `<@${members.first()!.user.id}>`;
			}

			return substring;
		});

		replacedMessage = replacedMessage.replace(regex2, (substring, username) => {
			const members = guild.members.cache.filter(
				member => member.nickname === username);

			if (members.size === 1) {
				return `<@${members.first()!.user.id}>`;
			}

			return substring;
		});

		// Resolve roles
		await guild.roles.fetch();
		const regexRole = /@([A-Za-z0-9-]+)/g;

		replacedMessage = replacedMessage.replace(regexRole, (substring, roleName) => {
			const roles = guild.roles.cache.filter(
				role => role.name === roleName);

			if (roles.size === 1) {
				return `<@&${roles.firstKey()}>`;
			}

			return substring;
		});

		// eslint-disable-next-line no-cond-assign
		while ((mention = regex2.exec(message)) !== null) {
			usersToFind.push(mention[1]);
		}

		await channel.send(replacedMessage);
	}
}
