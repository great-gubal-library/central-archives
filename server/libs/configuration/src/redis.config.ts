import config from 'config';
import { RedisConfigInterface } from './interfaces/redis-config.interface';

const REDIS_CONFIG = config.get<RedisConfigInterface>('redis');

export const redisConfiguration = {
  host: REDIS_CONFIG.host,
  port: REDIS_CONFIG.port,
  url: `redis://${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`,
};
