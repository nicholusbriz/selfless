// Enhanced Service Worker for PWA with Offline Messaging Support
const CACHE_NAME = 'selfless-messaging-v1';
const STATIC_CACHE = 'selfless-static-v1';

// Assets to cache for offline access
const STATIC_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/_next/static/css/app/layout.css',
  '/_next/static/css/app/page.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main-app.js',
  '/_next/static/chunks/app/_app-client.js',
  '/_next/static/chunks/app/login-client.js',
  '/_next/static/chunks/app/dashboard-client.js',
];

// Install event - cache static assets
self.addEventListener('install', function (event) {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('📦 Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function (event) {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Network-first strategy for API calls with offline fallback
self.addEventListener('fetch', function (event) {
  const request = event.request;
  const url = new URL(request.url);

  // Handle chat API calls with network-first strategy
  if (url.pathname.startsWith('/api/chat/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('📱 Serving cached chat data:', request.url);
              return cachedResponse;
            }
            // Return offline fallback for chat APIs
            return new Response(JSON.stringify({
              error: 'Offline - serving cached data',
              offline: true,
              cached: true
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }

  // Network-first for other API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({
          error: 'Offline - API unavailable',
          offline: true
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Navigation requests - always try network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        // Return cached page if offline
        return caches.match('/').then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return basic offline page
          return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Offline - Selfless</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                .offline-icon { font-size: 48px; margin-bottom: 20px; }
                .offline-title { color: #333; margin-bottom: 10px; }
                .offline-message { color: #666; }
              </style>
            </head>
            <body>
              <div class="offline-icon">📱</div>
              <h1 class="offline-title">You're Offline</h1>
              <p class="offline-message">Check your connection and try again.</p>
            </body>
            </html>
          `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
          });
        });
      })
    );
  }
});

// Background sync for queued messages
self.addEventListener('sync', function (event) {
  if (event.tag === 'queued-messages') {
    console.log('🔄 Background sync for queued messages');
    event.waitUntil(syncQueuedMessages());
  }
});

async function syncQueuedMessages() {
  try {
    // Get queued messages from IndexedDB or localStorage
    const queuedMessages = await getQueuedMessages();

    for (const message of queuedMessages) {
      try {
        const response = await fetch('/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });

        if (response.ok) {
          console.log('✅ Queued message synced');
          await removeQueuedMessage(message.id);
        }
      } catch (error) {
        console.error('❌ Failed to sync queued message:', error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Helper functions for IndexedDB (simplified)
async function getQueuedMessages() {
  // In a real implementation, use IndexedDB
  // For now, return empty array
  return [];
}

async function removeQueuedMessage(messageId) {
  // In a real implementation, remove from IndexedDB
  console.log('Removing queued message:', messageId);
}
