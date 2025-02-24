import { Strategy, StrategyHandler } from 'workbox-strategies';
import { AgifyResult } from './agify-result';
import { AGIFY_STORE, dbPromise } from './idb-config';

export class IdbStrategy extends Strategy {

  _handle(request: Request, handler: StrategyHandler): Promise<Response | undefined> {

    console.log('###_handle: request=', request);
    return new Promise(async (resolve, reject) => {
      const db = await dbPromise;
      const name = new URLSearchParams(new URL(request.url).search).get('name'); // Extrahiere name-Param aus URL
      let agifyResult = await db.get(AGIFY_STORE, name);

      if (agifyResult) {
        // Response in idb gefunden.
        console.log(`Eintrag für '${name}' in idb.`, agifyResult);

        const idbResponse = new Response(JSON.stringify(agifyResult), {
          /*
          // Headers may not have to be provided!
          headers: {
            'access-control-allow-credentials': 'true',
            'access-control-allow-origin': '*',
            'access-control-expose-headers': 'x-rate-limit-limit,x-rate-limit-remaining,x-rate-limit-reset',
            'cache-control': 'max-age=0, private, must-revalidate',
            'content-type': 'application/json; charset=utf-8'
          },
          */
          status: 200,
          statusText: 'OK'
        });
        console.log('idbResponse=', idbResponse);

        resolve(idbResponse);
      } else {
        console.log(`Eintrag für '${name}' nicht in idb.`);

        // Keinen Eintrag in idb gefunden.
        try {
          const fetchResponse = await handler.fetch(request);
          console.log('fetchResponse=', fetchResponse);

          if (fetchResponse.status === 200) {
            agifyResult = <AgifyResult>JSON.parse(await fetchResponse.clone().text());
            // Schreibe Response text in idb.
            console.log('Schreibe response text in idb', agifyResult);
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
