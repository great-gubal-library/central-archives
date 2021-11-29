import config from 'config';
import { DiscordConfigInterface } from './interfaces/discord-config.interface';

const DISCORD_CONFIG = config.get<DiscordConfigInterface>('discord');

export const discordConfiguration = DISCORD_CONFIG;
