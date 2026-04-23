// NewsBlur Mobile PWA Service Worker
// Handles push notifications and enables offline support

const CACHE_NAME = 'newsblur-mobile-v1';
const CACHE_URLS = [
    '/mobile/',
    '/reader/feeds/',
    '/manifest.webmanifest'
];

// Install service worker and cache resources
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(CACHE_URLS);
        }).then(() => self.skipWaiting())
    );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Handle push notifications
self.addEventListener('push', event => {
    console.log('[Service Worker] Push notification received');
    
    if (!event.data) {
        console.log('[Service Worker] No data in push event');
        return;
    }
    
    try {
        const data = event.data.json();
        const options = {
            body: data.body || 'New story available',
            icon: data.icon || '/media/img/favicon_64.png',
            badge: '/media/img/favicon_32.png',
            tag: 'newsblur-story',
            data: {
                story_hash: data.story_hash,
                feed_id: data.feed_id,
                url: data.url || ''
            }
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'NewsBlur', options)
        );
    } catch (error) {
        console.error('[Service Worker] Error parsing push data:', error);
        event.waitUntil(
            self.registration.showNotification('NewsBlur', {
                body: event.data.text(),
                icon: '/media/img/favicon_64.png'
            })
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('[Service Worker] Notification clicked');
    event.notification.close();
    
    const data = event.notification.data;
    const storyHash = data?.story_hash;
    const feedId = data?.feed_id;
    
    if (!storyHash || !feedId) {
        console.warn('[Service Worker] Missing story data, opening app');
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return clients.openWindow('/mobile/');
            })
        );
        return;
    }
    
    // Construct deeplink URL for iOS app
    const deeplink = `newsblur://story?feed_id=${encodeURIComponent(feedId)}&story_hash=${encodeURIComponent(storyHash)}`;
    console.log('[Service Worker] Opening deeplink:', deeplink);
    
    event.waitUntil(
        (async () => {
            // Try to open existing window first
            const clientList = await clients.matchAll({ type: 'window' });
            if (clientList.length > 0) {
                const client = clientList[0];
                client.focus();
                client.postMessage({
                    action: 'navigate_to_story',
                    story_hash: storyHash,
                    feed_id: feedId
                });
                return;
            }
            
            // If no window exists, try deeplink
            window.location.href = deeplink;
            
            // Fallback: open web reader after delay if deeplink doesn't work
            setTimeout(() => {
                clients.openWindow(`/reader/feed/${feedId}?story=${storyHash}`);
            }, 1500);
        })()
    );
});

// Handle notification close (for analytics)
self.addEventListener('notificationclose', event => {
    console.log('[Service Worker] Notification closed');
});

// Network-first caching strategy for feeds
self.addEventListener('fetch', event => {
    if (!event.request.url.includes('/reader/')) {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache successful responses
                if (response && response.status === 200) {
                    const cache = caches.open(CACHE_NAME);
                    cache.then(c => c.put(event.request, response.clone()));
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache if network fails
                return caches.match(event.request);
            })
    );
});
