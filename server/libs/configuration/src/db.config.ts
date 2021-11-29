import { Character, Event, EventLocation, EventNotification, Image, Server, Story, StoryTag, User } from '@app/entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import config from 'config';
import { DbConfigInterface } from './interfaces/db-config.interface';

const dbConfig = config.get<DbConfigInterface>('db');

export const dbConfiguration: TypeOrmModuleOptions = {
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  logging: true,
  timezone: 'Z',
  entities: [
    Character,
    Event,
    EventLocation,
    EventNotification,
    Image,
    Server,
    Story,
    StoryTag,
    User,
  ],
  synchronize: dbConfig.synchronize,
  keepConnectionAlive: true,
};

Object.assign(dbConfiguration, { type: dbConfig.type });
