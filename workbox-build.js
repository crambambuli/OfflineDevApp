const {injectManifest} = require('workbox-build');

const workboxConfig = {
  globDirectory: 'dist/offline-dev-app/browser',
  globPatterns: [
    'index.html',
    '*.css',
    '*.js',
    'icons/**/*'
  ],
  globIgnores: [
    // Skip ES5 bundles for Angular
    '**/*-es5.*.js'
  ],

  swSrc: 'src/service-worker.ts',
  swDest: 'dist/offline-dev-app/browser/sw.ts',

  // Angular takes care of cache busting for JS and CSS (in prod mode)
  dontCacheBustURLsMatching: new RegExp('.+.[a-f0-9]{20}.(?:js|css)'),

  // By default, Workbox will not cache files larger than 2Mb (might be an issue for dev builds)
  maximumFileSizeToCacheInBytes: 4 * 1024 * 1024 // 4Mb
};

injectManifest(workboxConfig).then(({count, size}) => {
  console.log(
    `Generated ${workboxConfig.swDest}, which will precache ${count} files, totaling ${size} bytes.`
  );
});
