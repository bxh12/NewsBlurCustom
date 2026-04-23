// NewsBlur Mobile PWA Service Worker
// Handles offline support, caching, and background sync

const CACHE_VERSION = 'newsblur-mobile-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Core files to cache on install
const STATIC_ASSETS = [
  '/mobile/',
  '/media/css/reader/mobile.css',
  '/media/css/reader/darkmode.css',
  '/media/js/jquery.min.js',
  '/media/img/logo_192.png',
  '/media/img/favicon.ico',
  '/offline.html',
];

// Install event: cache critical assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        // Try to cache files, but don't fail if some don't exist
        return Promise.allSettled(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`Failed to cache ${url}:`, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => !cacheName.startsWith(CACHE_VERSION))
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch event: serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip browser extensions and other origins
  if (url.origin !== location.origin) {
    return;
  }

  // API requests: network-first, cache as fallback
  if (url.pathname.includes('/reader/') || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response && response.status === 200 && response.type !== 'error') {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cache if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cache, return offline page
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            return new Response('Offline', { status: 503 });
          });
        })
    );
  }
  // Image requests: cache-first
  else if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((networkResponse) => {
          // Cache images on first fetch
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      }).catch(() => {
        // Return placeholder image if offline
        return new Response(
          '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#ddd" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666" font-size="14">Image offline</text></svg>',
          { headers: { 'Content-Type': 'image/svg+xml' } }
        );
      })
    );
  }
  // Static assets: cache-first
  else {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((networkResponse) => {
          // Cache on first fetch
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      }).catch(() => {
        // Return offline page for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
          return caches.match('/offline.html');
        }
        return new Response('Offline', { status: 503 });
      })
    );
  }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Push notification received', event);
  
  if (event.data) {
    const notificationData = event.data.json();
    const title = notificationData.title || 'NewsBlur';
    const options = {
      body: notificationData.body || 'New story available',
      icon: '/media/img/logo_192.png',
      badge: '/media/img/favicon.ico',
      tag: notificationData.tag || 'newsblur-notification',
      requireInteraction: false,
      data: notificationData.data || {},
      actions: [
        {
          action: 'open',
          title: 'Read',
        },
        {
          action: 'close',
          title: 'Dismiss',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Get the story URL from notification data
  const storyUrl = event.notification.data.url || '/mobile/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (let client of clientList) {
        if (client.url === storyUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if not found
      if (clients.openWindow) {
        return clients.openWindow(storyUrl);
      }
    })
  );
});

// Periodic background sync (when available)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);

  if (event.tag === 'sync-stories') {
    event.waitUntil(
      fetch('/reader/feeds', { method: 'GET' })
        .then((response) => {
          if (response.ok) {
            console.log('Stories synced in background');
          }
        })
        .catch((err) => {
          console.log('Background sync failed:', err);
        })
    );
  }
});
