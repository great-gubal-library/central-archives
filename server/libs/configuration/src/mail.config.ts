import config from 'config';
import { MailConfigInterface } from './interfaces/mail-config.interface';

const MAIL_CONFIG = config.get<MailConfigInterface>('mail');

export const mailConfiguration = MAIL_CONFIG;
