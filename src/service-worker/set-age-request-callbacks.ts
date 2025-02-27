import { RouteHandlerCallbackOptions, RouteMatchCallbackOptions } from 'workbox-core';
import { AGE_API_URL, AgeStruct } from './age-struct';
import { AGE_STORE, dbPromise } from './idb-config';

export const setAgeRequestMatchCallback = ({ url, request }: RouteMatchCallbackOptions) => {

  console.log('setAgeRequestMatchCallback: url=', url, 'request=', request);

  return url.href === AGE_API_URL;
};

// POST-Request: Sende Post-Request
export const setAgeRequestHandlerCallback = async ({
                                                     url,
                                                     request
                                                   }: RouteHandlerCallbackOptions): Promise<Response> => {

  console.log('setAgeRequestHandlerCallback: url=', url, 'request=', request);

  const requestBody = await request.clone().text();
  // Gibt es bereits eine request queue? Dann enqueue dort. Sonst fetch.
  // ...

  try {
    console.log('fetch', request);
    const fetchResponse = await fetch(request);
    console.log('fetchResponse=', fetchResponse);

    if (fetchResponse.status === 201) { // "Created"
      // Aktualisiere idb mit response body.
      const responseBody = await fetchResponse.clone().text();
      const agifyStruct = <AgeStruct>JSON.parse(responseBody);
      await (await dbPromise).put(AGE_STORE, agifyStruct);
    }

    return fetchResponse;
  } catch (error) { // Offline
    console.warn('fetch error (offline?):', error);

    // Request konnte nicht gesendet werden (offline) => enqueue, um später erneut zu senden.
    // ...

    // Aktualisiere idb dennoch (implizit: response body gleich request body).
    const agifyStruct = <AgeStruct>JSON.parse(requestBody);
    await (await dbPromise).put(AGE_STORE, agifyStruct);

    // Sende 200-Response zurück an Client.
    return new Response(requestBody, {
      status: 200,
      statusText: 'OK'
    });
  }
};
