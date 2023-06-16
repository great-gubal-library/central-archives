export interface DiscordConfigInterface {
	botToken: string;
	serverId: string;
	announcementChannels: { [ datacenter: string] : string };
	noticeboardChannel: string;
}
