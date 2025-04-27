import { Strategy, StrategyHandler } from 'workbox-strategies';
import { AGE_STORE, dbPromise } from './idb-config';
import { AgeStruct } from './age-struct';
import { WorkboxPlugin } from 'workbox-core/types';
import { SW_VERSION } from './sw-version';

export class GetAgeStrategy extends Strategy {

  constructor(plugins?: WorkboxPlugin[]) {
    super({ plugins });
  }

  async _handle(request: Request, handler: StrategyHandler): Promise<Response> {

    console.log('async IdbStrategy._handle: request=', request);

    const url = request.url;
    const pos = url.lastIndexOf('/');
    const name = url.substring(pos + 1); // "name" REST path param
    const db = await dbPromise;
    const ageEntryFromIdb = await db.get(AGE_STORE, name);

    if (ageEntryFromIdb) {
      // Passenden Eintrag in idb gefunden.
      console.log(`[${SW_VERSION}] Eintrag für «${name}» in idb.`, ageEntryFromIdb);

      const idbResponse = new Response(JSON.stringify(ageEntryFromIdb), { status: 200, statusText: 'OK' });
      console.log('idbResponse=', idbResponse);

      return idbResponse;
    } else {
      // Passenden Eintrag _nicht_ in idb gefunden.
      console.log(`[${SW_VERSION}] Eintrag für «${name}» nicht in idb.`);

      try {
        const fetchResponse = await handler.fetch(request);
        console.log('fetchResponse=', fetchResponse);

        if (fetchResponse.status === 200) {
          const ageEntryFromFetch = <AgeStruct>JSON.parse(await fetchResponse.clone().text());
          // Schreibe response struct in idb.
          console.log('Schreibe response struct in idb', ageEntryFromFetch);
          await db.add(AGE_STORE, { name: ageEntryFromFetch.name, age: ageEntryFromFetch.age });
        }
        return fetchResponse;
      } catch (error) {
        console.warn('Eintrag nicht in idb und fetch fehlgeschlagen', error);
        return Promise.reject(error);
      }
    }
  }
}
