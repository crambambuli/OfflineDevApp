import { Strategy, StrategyHandler } from 'workbox-strategies';
import { AGIFY_STORE, dbPromise } from './idb-config';
import { AgifyStruct } from './agify-struct';

export class IdbStrategy extends Strategy {
  async _handle(request: Request, handler: StrategyHandler): Promise<Response> {

    console.log('IdbStrategy._handle: request=', request);

    const db = await dbPromise;
    const name = new URLSearchParams(new URL(request.url).search).get('name'); // Extrahiere name-Param aus URL
    const agifyFromIdb = await db.get(AGIFY_STORE, name);

    if (agifyFromIdb) {
      // Response in idb gefunden.
      console.log(`Eintrag für '${name}' in idb.`, agifyFromIdb);

      const idbResponse = new Response(JSON.stringify(agifyFromIdb), { status: 200, statusText: 'OK' });
      console.log('idbResponse=', idbResponse);

      return idbResponse;
    } else {
      // Keinen Eintrag in idb gefunden.
      console.log(`Eintrag für '${name}' nicht in idb.`);

      try {
        const fetchResponse = await handler.fetch(request);
        console.log('fetchResponse=', fetchResponse);

        if (fetchResponse.status === 200) {
          const agifyResponse = <AgifyStruct>JSON.parse(await fetchResponse.clone().text());
          // Schreibe response struct in idb.
          console.log('Schreibe response struct in idb', agifyResponse);
          await db.add(AGIFY_STORE, { name: agifyResponse.name, age: agifyResponse.age }, name);
        }
        return fetchResponse;
      } catch (error) {
        console.warn('Eintrag nicht in idb und fetch fehlgeschlagen', error);
        return Promise.reject(error);
      }
    }
  }
}
