import { RouteHandlerCallbackOptions, RouteMatchCallbackOptions } from 'workbox-core';
import { AGE_API_URL, AgeStruct } from './age-struct';
import { AGE_STORE, dbPromise } from './idb-config';
import { Queue } from 'workbox-background-sync';

const requestQueue = new Queue('agePostRequestQueue');

export const agePostRequestMatchCallback = ({ url, request }: RouteMatchCallbackOptions) => {

  console.log('agePostRequestMatchCallback: url=', url, 'request=', request);

  return url.href === AGE_API_URL;
};

export const agePostRequestHandlerCallback = async ({ url, request }: RouteHandlerCallbackOptions)
  : Promise<Response> => {

  console.log('agePostRequestHandlerCallback: url=', url, 'request=', request);

  if (await requestQueue.size() > 0) {
    // Wenn Request Queue nicht leer, enqueue den Request sofort (ohne fetch), um die Reihenfolge zu wahren.
    console.log('[request queue not empty] enqueue request=', request);

    const requestBody = await request.clone().text();
    await updateIdb(requestBody);

    await requestQueue.pushRequest({ request });

    // Sende 200-Response zurück an Client.
    return new Response(requestBody, {
      status: 200,
      statusText: 'OK'
    });
  } else {
    try {
      const fetchRequest = request.clone();
      console.log('fetch', fetchRequest, await fetchRequest.clone().text());
      const fetchResponse = await fetch(fetchRequest);

      const responseBody = await fetchResponse.clone().text();
      console.log('fetchResponse=', fetchResponse, responseBody);

      if (fetchResponse.status === 201) { // "Created"
        // Aktualisiere idb mit response body.
        await updateIdb(responseBody);
      } // else: Server error => Gib als solchen zurück an Anwendung

      return fetchResponse;
    } catch (error) { // Offline
      console.warn('fetch error (offline):', error);

      // Request konnte nicht gesendet werden (offline) => enqueue, um später erneut zu senden.
      console.log('[error caught] enqueue request=', request);

      // Aktualisiere idb dennoch (implizit: response body gleich request body).
      const requestBody = await request.clone().text();
      await updateIdb(requestBody);

      await requestQueue.pushRequest({ request });

      // Sende 200-Response zurück an Client.
      return new Response(requestBody, {
        status: 200,
        statusText: 'OK'
      });
    }
  }
};

const updateIdb = async (requestOrResponseBody: string) => {
  console.log('updateIdb w/', requestOrResponseBody);

  const db = await dbPromise;
  const ageEntry = <AgeStruct>JSON.parse(requestOrResponseBody);
  await db.put(AGE_STORE, ageEntry);
}
