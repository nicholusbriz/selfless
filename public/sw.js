// public/sw.js - Service Worker for PWA with icon caching
// Cache version - increment this to force cache invalidation on deployment
const CACHE_VERSION = 'v7';
const CACHE_NAME = `freedom-tech-${CACHE_VERSION}`;
const STATIC_CACHE = `freedom-tech-static-${CACHE_VERSION}`;
const HTML_CACHE = `freedom-tech-html-${CACHE_VERSION}`;

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
            if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME && cacheName !== HTML_CACHE) {
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
  const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/);
  const isHTMLPage = url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/auth');

  // Network-first for HTML pages to prevent stale content on mobile
  if (isHTMLPage) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone and cache the HTML response
          const responseToCache = response.clone();
          caches.open(HTML_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fall back to cache if network fails
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || new Response('Offline - No cached version available', {
              status: 503,
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
        })
    );
    return;
  }

  // Cache-first for static assets (icons, images, etc.)
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
              // Don't cache if response is not vali
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
              console.log('[SW] Fetch failed for static asset:', error);
            });
        })
    );
  }
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