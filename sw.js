const CACHE_NAME = 'rgb-2048-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './game.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching assets');
                return cache.addAll(ASSETS);
            })
    );
});

// Fetch from Cache or Network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

// Update Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            );
        })
    );
});
