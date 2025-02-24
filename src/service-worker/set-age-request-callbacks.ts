import { RouteHandlerCallbackOptions, RouteMatchCallbackOptions } from 'workbox-core';
import { AgifyResult } from './agify-result';
import { AGIFY_STORE, dbPromise } from './idb-config';

export const setAgeRequestMatchCallback = ({ url, request }: RouteMatchCallbackOptions) => {

  console.log('###setAgeRequestMatchCallback: url=', url, 'request=', request);

  return url.host === 'api.agify.io' && url.pathname === '/set-age';
};

// POST-Request: Sende Post-Request
export const setAgeRequestHandlerCallback = async ({ url, request }: RouteHandlerCallbackOptions) => {

  console.log('###setAgeRequestHandlerCallback: url=', url, 'request=', request);

  const requestBody = await request.clone().text();

  // Gibt es bereits eine request queue? Dann enqueue dort. Sonst fetch.
  // ...

  try {
    console.log('###fetch', request);
    const fetchResponse = await fetch(request);
    console.log('###fetchResponse=', fetchResponse);

    if (fetchResponse.status === 200) {
      // Aktualisiere idb mit response body.
      const responseBody = await fetchResponse.clone().text();
      const agifyResult = <AgifyResult>JSON.parse(responseBody);
      await (await dbPromise).put(AGIFY_STORE, agifyResult, agifyResult.name);
    }

    return fetchResponse;
  } catch (error) { // Offline
    console.warn('fetch error (offline?):', error);
    // return Promise.reject(`###fetch fehlgeschlagen: ${error}`);

    // Request konnte nicht gesendet werden (offline) => enqueue, um später erneut zu senden.
    // ...

    // Aktualisiere idb dennoch (implizit: response body gleich request body).
    const agifyResult = <AgifyResult>JSON.parse(requestBody);
    //await (await dbPromise).put(AGIFY_STORE, agifyResult, agifyResult.name);
    await (await dbPromise).put(AGIFY_STORE, agifyResult);

    // Sende 200-Response zurück an Client.
    return new Response(requestBody, {
      status: 200,
      statusText: 'OK'
    });
  }
};
