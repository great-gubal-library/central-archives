import config from 'config';
import { AuthConfigInterface } from './interfaces/auth-config.interface';

export const authConfiguration: AuthConfigInterface = config.get<AuthConfigInterface>('auth');
