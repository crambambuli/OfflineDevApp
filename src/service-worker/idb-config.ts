import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { AgifyStruct } from './agify-struct';

const DB_NAME = 'request-db';
export const AGIFY_STORE = 'agify-store';

interface RequestDB extends DBSchema {
  [AGIFY_STORE]: {
    key: string;
    value: AgifyStruct;
  }
}

export const dbPromise: Promise<IDBPDatabase<RequestDB>> = openDB<RequestDB>(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(AGIFY_STORE, {
      keyPath: 'name' // wtf?
    });
  }
});
