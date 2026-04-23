// Simple Service Worker for PWA Installability
self.addEventListener('install', function () {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function () {
  console.log('Service Worker activating...');
  return self.clients.claim();
});

// Simple fetch handler - always use network (no offline caching)
self.addEventListener('fetch', function (event) {
  event.respondWith(fetch(event.request));
});
