import { MongoConnectionOptions } from 'typeorm/driver/mongodb/MongoConnectionOptions';
import * as dotenv from 'dotenv';
import {UserEntity} from "../user/domain/entity/user.entity";
import {MinistrieEntity} from "../ministrie/domain/entity/ministrie.entity";
import * as process from "process";
import {UserV2Entity} from "../user-v2/domain/entity/user-v2.entity";
import {InviteV2Entity} from "../user-v2/domain/entity/invite-v2.entity";

dotenv.config();

export const ORMConfig: MongoConnectionOptions = {
  type: 'mongodb',
  entities: [UserEntity, MinistrieEntity, UserV2Entity, InviteV2Entity],
  url: process.env.DB_URL,
  useUnifiedTopology: true,
  logging: true,
  synchronize: true,
  logger: 'simple-console',
  entityPrefix: 'ibb-',
  database: 'ibb'
};