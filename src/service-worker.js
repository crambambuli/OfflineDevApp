import {createHandlerBoundToURL, precacheAndRoute} from 'workbox-precaching';
import {googleFontsCache, imageCache} from 'workbox-recipes';
import {NavigationRoute, registerRoute} from "workbox-routing";
import {clientsClaim, setCacheNameDetails} from "workbox-core";

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

googleFontsCache({cachePrefix: 'wb7-gfonts'});

// CONTENT

imageCache({cacheName: 'wb7-content-images', maxEntries: 10});

// RUNTIME CACHING

// APP SHELL UPDATE FLOW

addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
