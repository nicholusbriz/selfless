// public/sw.js - Minimal Service Worker for PWA standalone mode only
// No app-shell caching: pages and assets always come from the network.
const CACHE_VERSION = "selfless-portal-v5";
const CACHE_PREFIX = "selfless-portal-";

self.addEventListener("install", (event) => {
  console.log("[SW] Installing", CACHE_VERSION);
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating", CACHE_VERSION);
  // A deployment must never keep an older application cache alive.
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName.startsWith(CACHE_PREFIX) ||
              cacheName !== CACHE_VERSION
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }

            return Promise.resolve(false);
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch handler to handle navigation requests
// This fixes the "page not found" issue when launching PWA
self.addEventListener("fetch", (event) => {
  // Only intercept navigation requests, let all other requests pass through normally
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If network fails, return cached index or offline page
        return caches.match("/") || new Response("Offline", { status: 503 });
      }),
    );
  }
  // For all other requests (API calls, static assets, etc.), don't intercept
  // This prevents service worker interference with normal network requests
});
