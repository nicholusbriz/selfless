// Simple Service Worker for PWA Installability
self.addEventListener('install', function () {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function () {
  console.log('Service Worker activating...');
  return self.clients.claim();
});

// Simple fetch handler - ignore API calls, handle navigation with network
self.addEventListener('fetch', function (event) {
  // Don't intercept API calls - let them go directly to network
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Only handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
  }
});
