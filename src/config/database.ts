import { MongoConnectionOptions } from 'typeorm/driver/mongodb/MongoConnectionOptions';
import * as dotenv from 'dotenv';
import {UserEntity} from "../user/domain/entity/user.entity";
import {MinistrieEntity} from "../ministrie/domain/entity/ministrie.entity";

dotenv.config();

export const ORMConfig: MongoConnectionOptions = {
  type: 'mongodb',
  entities: [UserEntity, MinistrieEntity],
  url: 'mongodb+srv://filipefirmino:P22J9JoyBsyMrc6M@ibbclustermongodb.meo2m.mongodb.net/?retryWrites=true&w=majority&appName=IbbClusterMongoDb',
  useUnifiedTopology: true,
  logging: true,
  synchronize: true,
  logger: 'simple-console',
  entityPrefix: 'ibb-',
  database: 'ibb'
};