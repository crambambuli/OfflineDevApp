import { Strategy, StrategyHandler } from 'workbox-strategies';

import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { AgifyResult } from './agify-result';

const DB_NAME = 'request-db';
const AGIFY_STORE = 'agify-store';

interface RequestDB extends DBSchema {
  [AGIFY_STORE]: {
    key: string;
    value: AgifyResult;
  }
}

export class IdbStrategy extends Strategy {

  private dbPromise: Promise<IDBPDatabase<RequestDB>>;

  constructor() {
    super();

    this.dbPromise = openDB<RequestDB>(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(AGIFY_STORE, {
          keyPath: 'name' // wtf?
        });
      }
    });
  }

  _handle(request: Request, handler: StrategyHandler): Promise<Response | undefined> {
    return new Promise(async (resolve, reject) => {
      const db = await this.dbPromise;
      const name = new URLSearchParams(new URL(request.url).search).get('name'); // Extrahiere name-Param aus URL
      let agifyResult = await db.get(AGIFY_STORE, name);

      if (agifyResult) {
        // Response in idb gefunden.
        console.log(`Eintrag für '${name}' in idb.`, agifyResult);
        resolve(new Response(JSON.stringify(agifyResult), { status: 200, statusText: 'OK' }));
      } else {
        console.log(`Eintrag für '${name}' nicht in idb.`);

        // Keinen Eintrag in idb gefunden.
        try {
          const fetchResponse = await handler.fetch(request);
          console.log('fetchResponse=', fetchResponse);

          if (fetchResponse.status === 200) {
            agifyResult = <AgifyResult>JSON.parse(await fetchResponse.clone().text());
            // Schreibe Response body in idb.
            console.log('Schreibe response body in idb', agifyResult);
            await db.add(AGIFY_STORE, agifyResult, name);
          }
          resolve(fetchResponse);
        } catch (e: any) {
          console.warn('###Eintrag nicht in idb und fetch fehlgeschlagen', e);
          reject(e);
        }
      }
    });
  }
}
