import config from './env';
import { type Db, MongoClient } from 'mongodb';

let db: Db;

async function initializeClient(): Promise<Db> {
  const client = await MongoClient.connect(config.MONGODB_URI);

  return client.db();
}

export default async (): Promise<Db> => {
  if (!db) {
    db = await initializeClient();
  }
  return db;
};
