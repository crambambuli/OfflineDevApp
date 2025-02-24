import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { googleFontsCache, imageCache } from 'workbox-recipes';
import { NavigationRoute, registerRoute } from "workbox-routing";
import { clientsClaim, setCacheNameDetails } from "workbox-core";
import { IdbStrategy } from './service-worker/idb-strategy';
import { PrecacheEntry } from 'workbox-precaching/src/_types';
import { CacheStrategy } from './service-worker/cache-strategy';
import { setAgeRequestHandlerCallback, setAgeRequestMatchCallback } from './service-worker/set-age-request-callbacks';

// Bereits in workbox-precaching unvollständig deklariert - hier ergänzt (um skipWaiting).
declare global {
  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: Array<PrecacheEntry | string>;

    skipWaiting(): void;
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


registerRoute(new RegExp('https://api\\.agify\\.io.*'), new IdbStrategy());

registerRoute(setAgeRequestMatchCallback, setAgeRequestHandlerCallback, 'POST');

registerRoute(new RegExp('https://api\\.genderize\\.io.*'), new CacheStrategy());


// APP SHELL UPDATE FLOW

addEventListener('message', (event) => {
  if (event?.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
