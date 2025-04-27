import { Strategy, StrategyHandler } from 'workbox-strategies';
import { SW_VERSION } from './sw-version';

export class CacheStrategy extends Strategy {
  _handle(request: Request, handler: StrategyHandler): Promise<Response | undefined> {

    console.log('CacheStrategy._handle: request=', request);

    return new Promise(async (resolve, reject) => {
      // Request in Cache?
      const cacheMatchResponse = await handler.cacheMatch(request);
      console.log('cacheMatchResponse=', cacheMatchResponse);

      if (cacheMatchResponse) {
        // Eintrag für Request gefunden in Cache => Gib Response (Clone!) oder neue Response zurück.
        console.log(`[${SW_VERSION}] Eintrag (Response) für Request ${request.url} in ServiceWorker-Cache`);
        const newResponse = cacheMatchResponse.clone();

        /*
        const responseBody = await cacheMatchResponse.text();
        console.log('responseBody=', responseBody);

        const responseBodyJson = JSON.parse(responseBody);
        // responseBodyJson.age += 100;

        const newResponse = new Response(JSON.stringify(responseBodyJson), {
          headers: cacheMatchResponse.headers,
          status: cacheMatchResponse.status,
          statusText: cacheMatchResponse.statusText
        });
        */
        console.log('newResponse=', newResponse);

        resolve(newResponse);
      } else {
        // Kein Eintrag in Cache => Sende Request und schreibe Response in Cache.
        console.log(`[${SW_VERSION}]  Kein Eintrag für Request ${request.url} in ServiceWorker-Cache`);

        // Sende Request und schreibe Response in Cache (in einem Schritt).
        try {
          const fetchAndCachePutResponse = await handler.fetchAndCachePut(request);
          console.log('fetchAndCachePutResponse=', fetchAndCachePutResponse);
          if (fetchAndCachePutResponse) {
            resolve(fetchAndCachePutResponse);
          } else {
            reject('Eintrag nicht in Cache und fetch fehlgeschlagen');
          }
        } catch (e) {
          reject('Eintrag nicht in Cache und fetch fehlgeschlagen');
        }

        /*
        // Sende Request
        const fetchResponse = await handler.fetch(request);
        console.log('fetchResponse=', fetchResponse);
        if (fetchResponse) {
          // Schreibe Response (Clone) in Cache. Kann theoretisch fehlschlagen (egal).
          await handler.cachePut(request, fetchResponse.clone());
          resolve(fetchResponse);
        } else {
          reject('Kein Eintrag im Cache und fetch fehlgeschlagen');
        }
        */
      }
    });
  }
}
