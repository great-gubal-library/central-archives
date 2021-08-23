import config from 'config';
import { ServerConfigInterface } from './interfaces/server-config.interface';

export const serverConfiguration = config.get<ServerConfigInterface>('server');
