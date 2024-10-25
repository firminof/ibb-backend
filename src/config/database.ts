import { MongoConnectionOptions } from 'typeorm/driver/mongodb/MongoConnectionOptions';
import * as dotenv from 'dotenv';
import {UserEntity} from "../user/domain/entity/user.entity";
import {MinistrieEntity} from "../ministrie/domain/entity/ministrie.entity";
import * as process from "process";

dotenv.config();

export const ORMConfig: MongoConnectionOptions = {
  type: 'mongodb',
  entities: [UserEntity, MinistrieEntity],
  url: process.env.DB_URL,
  useUnifiedTopology: true,
  logging: true,
  synchronize: true,
  logger: 'simple-console',
  entityPrefix: 'ibb-',
  database: 'ibb'
};