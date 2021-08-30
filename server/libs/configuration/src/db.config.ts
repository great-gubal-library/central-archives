import { Character, Server, User } from '@app/entity';
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
  entities: [
    Character,
    Server,
    User,
  ],
  synchronize: dbConfig.synchronize,
  keepConnectionAlive: true,
};

Object.assign(dbConfiguration, { type: dbConfig.type });
