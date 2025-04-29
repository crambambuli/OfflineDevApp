# OfflineDevApp
PWA to export/import cached app data for offline development

Capabilities/Use Case:

- Collect application data while in VPN
- Export application and other cached data (GIS) to file
- Run local http-server outside VPN
- Import application data etc. from file
- Run/develop application in offline-mode

## Development server without Service Worker support

To start a local development server without Service Worker support, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Run as PWA

Building the distribution entails an Angular build (ng build) together with a Workbox build
to initialize the Service Worker and package the application.
The artifacts are in the `dist/browser/` directory.

```bash
npm run build-pwa
```

Start local HTTP server:
```bash
http-server dist/offline-dev-app/browser -c-1
```
Once the server is running, open your browser and navigate to `http://localhost:8080/`.

On rebuilding the distribution, the server updates automatically. The application must be reloaded manually.

Start local Node Express demo server for Agify REST API calls (offering a POST request beside a GET request):
```bash
node api-server/server
```

## Demo Application

### Genderize
Demonstrates usage of the Service Worker Cache (with a cache-first strategy).

GET request is intercepted by the service worker.
If a matching response is found in the service worker cache, this response is returned.
Otherwise, the Genderize.io REST API is called, the response is put in the cache and returned to the caller.

### Agify
Demonstrates usage of IndexedDB.

Service worker intercepts both GET and POST requests.
Contents of response is parsed and put as object into IndexedDB. For POST requests, object in IndexedDB is updated.

### Nationalize
Demonstrates an ordinary HTTP request bypassing the service worker.

### Home
Demonstrates usage of the file system access API to export and import an IndexedDB table to and from a JSON file.

### Offline Mode
Stop the http-server process or put the browser tab in offline mode. Then reload the page.

### Application Update Demo
Update the application, e.g. by incrementing the version number in sw-version.ts. Build the distribution (see above). Reload the page.
A dialog saying "A new version of the website is available" appears at the bottom. Click Reload page.
Try also with more than one open tab.
The version number is logged in the console on fetch requests.

Update and build the application. Close all application tabs. Reopen the app in a new tab.

### Headless Mode (Chrome)
Click on "In App öffnen" in the Chrome address bar.

### Environment
Tested under NPM version 11.2.0 and Node version v22.11.0.
