import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { googleFontsCache, imageCache } from 'workbox-recipes';
import { NavigationRoute, registerRoute, setCatchHandler, setDefaultHandler } from "workbox-routing";
import { clientsClaim, RouteHandlerCallbackOptions, setCacheNameDetails } from "workbox-core";
import { PrecacheEntry } from 'workbox-precaching/src/_types';
import { GetAgeStrategy } from './service-worker/get-age-strategy';
import { CacheStrategy } from './service-worker/cache-strategy';
import { agePostRequestHandlerCallback, agePostRequestMatchCallback } from './service-worker/set-age-request-callbacks';
import { AGE_API_URL } from './service-worker/age-struct';
import { SW_VERSION } from './service-worker/sw-version';

// Bereits in workbox-precaching unvollständig deklariert - hier ergänzt (um skipWaiting).
declare global {
  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: Array<PrecacheEntry | string>;

    skipWaiting(): void;

    addEventListener(type: string, listener: (event: any) => void): void;
  }
}

declare const self: ServiceWorkerGlobalScope;

// SETTINGS

// Claiming control to start runtime caching asap
clientsClaim();

// Use to update the app after user triggered refresh
//self.skipWaiting();

// Setting custom cache names
setCacheNameDetails({ precache: 'wb7-precache', runtime: 'wb7-runtime' });

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
googleFontsCache({ cachePrefix: 'wb7-gfonts' });

// CONTENT

// https://developer.chrome.com/docs/workbox/modules/workbox-recipes#image_cache
imageCache({ cacheName: 'wb7-content-images', maxEntries: 10 });

// RUNTIME CACHING

registerRoute(new RegExp('https://api\\.genderize\\.io.*'), new CacheStrategy());

/*
const bgSyncPlugin = new BackgroundSyncPlugin('myQueueName', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});
registerRoute(new RegExp(`${AGE_API_URL}.*`), new GetAgeStrategy([bgSyncPlugin]));
*/
registerRoute(new RegExp(`${AGE_API_URL}.*`), new GetAgeStrategy());

registerRoute(agePostRequestMatchCallback, agePostRequestHandlerCallback, 'POST');

// GET-Request by default
// If you want to supply a "handler" for requests that don't match a route, you can set a default handler.
/*
setDefaultHandler(({ url, event, params }: RouteHandlerCallbackOptions) => {
  return Promise.reject(`Default handler für URL ${url.href}`);
});
*/

// In the case of any of your routes throwing an error, you can capture and degrade gracefully by setting
// a catch handler.
setCatchHandler(({ url, event, params }: RouteHandlerCallbackOptions) => {
  return Promise.reject(`Catch handler für URL ${url.href}`);
});


// APP SHELL UPDATE FLOW

self.addEventListener('message', (event) => {
  if (event?.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('sync', async (event) => {

  console.log('[service-worker] sync event listener', event);

});

self.addEventListener('message', event => {
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage(SW_VERSION);
  }
});

/*
const queue = new Queue('myQueueName');

self.addEventListener('fetch', (event) => {

  console.log('[service-worker] fetch event listener', event);


  // Add in your own criteria here to return early if this
  // isn't a request that should use background sync.
  if (event.request.method !== 'POST') {
    return;
  }

  const bgSyncLogic = async () => {
    try {
      const response = await fetch(event.request.clone());
      return response;
    } catch (error) {
      await queue.pushRequest({request: event.request});
      return error;
    }
  };

  event.respondWith(bgSyncLogic());
});
*/
