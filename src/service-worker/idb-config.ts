import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { AgeStruct } from './age-struct';

export const DB_NAME = 'request-db';
export const AGE_STORE = 'age-store';

export interface RequestDB extends DBSchema {
  [AGE_STORE]: {
    key: string;
    value: AgeStruct;
  }
}

export const dbPromise: Promise<IDBPDatabase<RequestDB>> = openDB<RequestDB>(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(AGE_STORE, {
      keyPath: 'name'
    });
  }
});
