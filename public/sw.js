// public/sw.js - Minimal Service Worker for PWA standalone mode only
// No caching - all content loads from network
// This service worker exists only to enable PWA installation for standalone mode
const CACHE_VERSION = 'v2.0.0';

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  // Clean up any old caches from previous versions
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch handler to handle navigation requests
// This fixes the "page not found" issue when launching PWA
self.addEventListener('fetch', (event) => {
  // Only intercept navigation requests, let all other requests pass through normally
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If network fails, return cached index or offline page
        return caches.match('/') || new Response('Offline', { status: 503 });
      })
    );
  }
  // For all other requests (API calls, static assets, etc.), don't intercept
  // This prevents service worker interference with normal network requests
});