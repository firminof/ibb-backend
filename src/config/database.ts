import { MongoConnectionOptions } from 'typeorm/driver/mongodb/MongoConnectionOptions';
import * as dotenv from 'dotenv';
import {UserEntity} from "../user/domain/entity/user.entity";

dotenv.config();

export const ORMConfig: MongoConnectionOptions = {
  type: 'mongodb',
  entities: [UserEntity],
  url: process.env.DB_URL,
  useUnifiedTopology: true,
  logging: true,
  synchronize: true,
  logger: 'simple-console',
  entityPrefix: 'ibb-',
  database: 'ibb'
};