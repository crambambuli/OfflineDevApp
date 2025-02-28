import { RouteHandlerCallbackOptions, RouteMatchCallbackOptions } from 'workbox-core';
import { AGE_API_URL, AgeStruct } from './age-struct';
import { AGE_STORE, dbPromise } from './idb-config';
import { requestQueue } from './age-request-queue';

export const agePostRequestMatchCallback = ({ url, request }: RouteMatchCallbackOptions) => {

  console.log('agePostRequestMatchCallback: url=', url, 'request=', request);

  return url.href === AGE_API_URL;
};

export const agePostRequestHandlerCallback = async ({ url, request }: RouteHandlerCallbackOptions)
  : Promise<Response> => {

  console.log('agePostRequestHandlerCallback: url=', url, 'request=', request);

  // Gibt es bereits Einträge in Request Queue? => Versuche, RQ abzuarbeiten.
  if (!requestQueue.empty()) {
    await requestQueue.processRequests(); // Try to send (fetch) all previously unsent requests
  }

  // RQ _nicht_ leer => Enqueue in RQ (ohne fetch), sonst sende fetch-Request.
  if (!requestQueue.empty()) { // Still offline
    console.log('[rq not empty] enqueue request=', request);
    requestQueue.enqueue(request);

    const requestBody = await request.clone().text();
    await updateIdb(requestBody);

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
      requestQueue.enqueue(request);

      // Aktualisiere idb dennoch (implizit: response body gleich request body).
      const requestBody = await request.clone().text();
      await updateIdb(requestBody);

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
