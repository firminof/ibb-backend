import { MongoConnectionOptions } from 'typeorm/driver/mongodb/MongoConnectionOptions';
import * as dotenv from 'dotenv';

dotenv.config();

export const ORMConfig: MongoConnectionOptions = {
  type: 'mongodb',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  url: process.env.DB_URL,
  useUnifiedTopology: true,

};
