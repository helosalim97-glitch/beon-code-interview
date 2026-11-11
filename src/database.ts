
import { Database } from './databases/database_abstract';
import { MongoStrategy } from './databases/mongo/mongodb';
import { PostgreStrategy } from './databases/postgres/postgres';

export class DatabaseInstanceStrategy {
  private static _instance: Database;

  static getInstance(): Database {
    if (!this._instance) {
      throw new Error('Database has not been initialized');
    }

    return this._instance;
  }

  static async setInstanceByEnv(env: string): Promise<void> {
    switch (env) {
      case 'mongo':
        this._instance = new MongoStrategy();
        break;

      case 'postgres':
        this._instance = new PostgreStrategy();
        break;

      default:
        throw new Error(`DB type ${env} is not supported`);
    }
  }
}
