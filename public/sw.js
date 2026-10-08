// public/sw.js - Service Worker for PWA (iOS compatible)
const CACHE_VERSION = "selfless-portal-v6";
const CACHE_PREFIX = "selfless-portal-";

self.addEventListener("install", (event) => {
  console.log("[SW] Installing", CACHE_VERSION);
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating", CACHE_VERSION);
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

// Fetch handler for PWA navigation support
self.addEventListener("fetch", (event) => {
  // Only intercept navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If network fails, return cached index
        return caches.match("/").then((cached) => {
          if (cached) return cached;
          return new Response("Offline", { status: 503 });
        });
      }),
    );
  }
  // Let all other requests pass through normally
});
