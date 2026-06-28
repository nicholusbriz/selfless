// public/sw.js - Service Worker for PWA with icon caching
// Cache version - increment this to force cache invalidation on deployment
const CACHE_VERSION = 'v5';
const CACHE_NAME = `freedom-tech-${CACHE_VERSION}`;
const STATIC_CACHE = `freedom-tech-static-${CACHE_VERSION}`;

// Assets to cache for PWA installation (static assets only - not HTML pages)
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/freedom.png',
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png',
  '/favicon.ico',
  '/favicon.ico.png'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching app shell and icons');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages immediately
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  const isHTMLRequest = event.request.headers.get('accept')?.includes('text/html');
  const isAPIRoute = url.pathname.startsWith('/api');
  const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/);

  // NEVER cache API routes - always fetch fresh data
  if (isAPIRoute) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Don't cache API responses
          return response;
        })
        .catch((error) => {
          console.log('[SW] API fetch failed:', error);
          throw error;
        })
    );
    return;
  }

  // Network-first for HTML pages (always get fresh content)
  if (isHTMLRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Don't cache HTML responses - always serve fresh
          return response;
        })
        .catch((error) => {
          console.log('[SW] Network failed for HTML, trying cache:', error);
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-first for static assets (icons, images, etc.) ONLY
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // Return cached version if available
          if (cachedResponse) {
            // Optionally update cache in background
            fetch(event.request).then((response) => {
              if (response && response.status === 200) {
                caches.open(STATIC_CACHE).then((cache) => {
                  cache.put(event.request, response);
                });
              }
            });
            return cachedResponse;
          }

          // Otherwise, fetch from network and cache
          return fetch(event.request)
            .then((response) => {
              // Don't cache if response is not valid
              if (!response || response.status !== 200) {
                return response;
              }

              // Clone the response since it can only be consumed once
              const responseToCache = response.clone();

              // Cache the fetched response for future
              caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            })
            .catch((error) => {
              console.log('[SW] Fetch failed:', error);
            });
        })
    );
    return;
  }

  // For all other requests, use network-first (no caching)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.log('[SW] Fetch failed for:', url.pathname, error);
        // Don't throw - let browser handle the error naturally
        return new Response('Network error', { status: 503 });
      })
  );
});

// Listen for messages from client (e.g., to clear cache on logout)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches on logout');
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    });
  }
});