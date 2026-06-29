// public/sw.js - Minimal Service Worker for PWA standalone mode only
// No caching - all content loads from network
// This service worker exists only to enable PWA installation for standalone mode

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

// No fetch handler - let browser handle all requests normally
// This ensures all content loads from network without caching