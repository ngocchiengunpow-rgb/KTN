const CACHE_NAME = 'vimedu-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/assets/logo.svg',
  '/manifest.json'
];

// Install Event - cache the shell precaches
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching core assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - clean up obsolete cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Cleaning old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - intercept and cache static asset requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Bypass API endpoints to allow db.js to coordinate live/offline data queries natively
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. Bypass Vite dev-server HMR requests (ws connections, hot-reloading parameters, ping)
  if (
    url.pathname.startsWith('/@vite/') || 
    url.pathname.includes('hot-update') || 
    event.request.mode === 'websocket' ||
    url.pathname.includes('/__vite_ping')
  ) {
    return;
  }

  // 3. Network-First strategy for HTML document navigations (to always get the latest layout if online)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Save a fresh copy to the cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Network failed, serve the cached index.html
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 4. Stale-While-Revalidate strategy for static resources (CSS, JS, SVG, Images, Fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          console.warn('[Service Worker] Fetch failed, serving cached copy:', event.request.url, err);
        });

      return cachedResponse || fetchPromise;
    })
  );
});
