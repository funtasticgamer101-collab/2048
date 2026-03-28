const CACHE_NAME = 'rgb-2048-v4'; // Bump this number if you ever make massive structural changes
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icon.svg'
];

// 1. INSTALL EVENT: Cache the files and force immediate activation
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching all assets');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting()) // Forces the waiting SW to become active immediately
    );
});

// 2. ACTIVATE EVENT: Clean up old caches so you don't get stuck with stale files
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Takes control of the page immediately
    );
});

// 3. FETCH EVENT: "Network First, Fallback to Cache" Strategy
self.addEventListener('fetch', event => {
    // We only want to handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // If we are online and the fetch is successful, update the cache with the fresh file
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // If the network fails (user is offline), serve the file from the cache
                console.log('[Service Worker] Offline - serving from cache:', event.request.url);
                return caches.match(event.request);
            })
    );
});
