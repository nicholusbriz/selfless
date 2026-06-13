// public/sw.js - Minimal version, no fetch errors
const CACHE_NAME = 'freedom-tech-v1';

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(self.clients.claim());
});

// No fetch handling - just let the browser work normally
// This gives you PWA install without any caching errors