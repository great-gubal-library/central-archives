import config from 'config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from '@app/entity';
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
    UserEntity
  ],
  synchronize: dbConfig.synchronize,
  keepConnectionAlive: true,
};

Object.assign(dbConfiguration, { type: dbConfig.type });
