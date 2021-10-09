import config from 'config';
import { S3ConfigInterface } from './interfaces/s3-config.interface';

export const s3Configuration = config.get<S3ConfigInterface>('s3');
