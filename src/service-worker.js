import {createHandlerBoundToURL, precacheAndRoute} from 'workbox-precaching';
import {googleFontsCache, imageCache} from 'workbox-recipes';
import {NavigationRoute, registerRoute} from "workbox-routing";
import {clientsClaim, setCacheNameDetails} from "workbox-core";
import {CacheFirst, NetworkFirst, Strategy} from "workbox-strategies";

// SETTINGS

// Claiming control to start runtime caching asap
clientsClaim();

// Use to update the app after user triggered refresh
//self.skipWaiting();

// Setting custom cache names
setCacheNameDetails({precache: 'wb7-precache', runtime: 'wb7-runtime'});

// PRECACHING

// Precache and serve resources from __WB_MANIFEST array
precacheAndRoute(self.__WB_MANIFEST);

// NAVIGATION ROUTING

// This assumes /index.html has been precached.
const navHandler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(navHandler);
registerRoute(navigationRoute);

// STATIC RESOURCES

// https://developer.chrome.com/docs/workbox/modules/workbox-recipes#google_fonts_cache
googleFontsCache({cachePrefix: 'wb7-gfonts'});

// CONTENT

// https://developer.chrome.com/docs/workbox/modules/workbox-recipes#image_cache
imageCache({cacheName: 'wb7-content-images', maxEntries: 10});

// RUNTIME CACHING

/*
const matchCallback = ({url, request, event}) => {
  console.log('###matchCallback:', url, request, event);
  return false;
}
registerRoute(matchCallback, new NetworkFirst());
*/


class IDBStrategy extends Strategy {
  _handle(request, handler) {

    console.log('###IDBStrategy._handle: request=', request);

    return new Promise(async (resolve, reject) => {
      const cacheMatchResponse = await handler.cacheMatch(request);
      console.log('###cacheMatchResponse=', cacheMatchResponse);

      // Stattdessen: Suche nach Response in IDB (statt in Cache).
      // ...

      if (cacheMatchResponse) {
        // const newResponse = cacheMatchResponse.clone();

        const responseBody = await cacheMatchResponse.text();
        console.log('###responseBody=', responseBody);

        const responseBodyJson = JSON.parse(responseBody);
        responseBodyJson.age += 100;

        const newResponse = new Response(JSON.stringify(responseBodyJson), {
          headers: cacheMatchResponse.headers,
          status: cacheMatchResponse.status,
          statusText: cacheMatchResponse.statusText
        });
        console.log('###newResponse=', newResponse);

        resolve(newResponse);
      } else {

        /*
        const fetchAndCachePutResponse = await handler.fetchAndCachePut(request);
        console.log('###fetchAndCachePutResponse=', fetchAndCachePutResponse);

        if (fetchAndCachePutResponse) {
          resolve(fetchAndCachePutResponse);
        } else {
          reject('Eintrag nicht im Cache und fetch fehlgeschlagen');
        }
        */

        const fetchResponse = await handler.fetch(request);
        console.log('###fetchResponse=', fetchResponse);
        if (fetchResponse) {

          await handler.cachePut(request, fetchResponse.clone());

          // Stattdessen: Lege Response in IDB ab (statt in Cache).

          resolve(fetchResponse);
        } else {
          reject('Eintrag nicht gecacht und fetch fehlgeschlagen');
        }


        // Stattdessen:
        // - fetch
        // - put in IDB (statt in Cache)


      }
    });

  }
}

registerRoute(new RegExp('https://api\\.agify\\.io.*'), new IDBStrategy());


// APP SHELL UPDATE FLOW

addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
