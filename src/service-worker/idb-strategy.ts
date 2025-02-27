import { Strategy, StrategyHandler } from 'workbox-strategies';
import { AGE_STORE, dbPromise } from './idb-config';
import { AgeStruct } from './age-struct';

export class IdbStrategy extends Strategy {
  async _handle(request: Request, handler: StrategyHandler): Promise<Response> {

    console.log('IdbStrategy._handle: request=', request);

    const url = request.url;
    const pos = url.lastIndexOf('/');
    const name = url.substring(pos + 1); // "name" REST path param
    const ageStructFromIdb = await (await dbPromise).get(AGE_STORE, name);

    if (ageStructFromIdb) {
      // Response in idb gefunden.
      console.log(`Eintrag für '${name}' in idb.`, ageStructFromIdb);

      const idbResponse = new Response(JSON.stringify(ageStructFromIdb), { status: 200, statusText: 'OK' });
      console.log('idbResponse=', idbResponse);

      return idbResponse;
    } else {
      // Keinen Eintrag in idb gefunden.
      console.log(`Eintrag für '${name}' nicht in idb.`);

      try {
        const fetchResponse = await handler.fetch(request);
        console.log('fetchResponse=', fetchResponse);

        if (fetchResponse.status === 200) {
          const ageStructResponse = <AgeStruct>JSON.parse(await fetchResponse.clone().text());
          // Schreibe response struct in idb.
          console.log('Schreibe response struct in idb', ageStructResponse);
          await (await dbPromise).add(AGE_STORE, { name: ageStructResponse.name, age: ageStructResponse.age });
        }
        return fetchResponse;
      } catch (error) {
        console.warn('Eintrag nicht in idb und fetch fehlgeschlagen', error);
        return Promise.reject(error);
      }
    }
  }
}
