// Service Worker for Financial Command Centre v7.60
// Enhanced offline support and caching strategy

const CACHE_VERSION = 'v7.60';
const CACHE_NAME = `fcc-${CACHE_VERSION}`;
const RUNTIME_CACHE = `fcc-runtime-${CACHE_VERSION}`;
const API_CACHE = `fcc-api-${CACHE_VERSION}`;

// Critical assets to pre-cache on install
const CRITICAL_ASSETS = [
    '/',
    '/financial_command_centre.html',
    '/manifest.json',
    '/icon.svg'
];

// API endpoints that should use network-first strategy
const API_ENDPOINTS = [
    'api.coingecko.com',
    'api.finnhub.io',
    'api.exchangerate-api.com'
];

// Install event - pre-cache critical resources
self.addEventListener('install', (event) => {
    console.log(`[SW] Installing ${CACHE_NAME}`);

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log(`[SW] Pre-caching critical assets`);
            return cache.addAll(CRITICAL_ASSETS).catch((err) => {
                // Some assets might fail, but don't block install
                console.warn('[SW] Some assets failed to pre-cache:', err);
            });
        }).then(() => {
            // Immediately claim clients
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log(`[SW] Activating ${CACHE_NAME}`);

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => {
                        // Delete old caches
                        return cacheName.startsWith('fcc-') &&
                               !cacheName.includes(CACHE_VERSION);
                    })
                    .map((cacheName) => {
                        console.log(`[SW] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => {
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome extensions and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Check if this is an API request
    const isAPI = API_ENDPOINTS.some(endpoint => url.hostname.includes(endpoint));

    if (isAPI) {
        // Network-first strategy for API calls
        event.respondWith(networkFirst(request));
    } else if (request.destination === '' || url.pathname === '/') {
        // Cache-first for root/navigation
        event.respondWith(cacheFirstWithFallback(request));
    } else {
        // Stale-while-revalidate for other assets
        event.respondWith(staleWhileRevalidate(request));
    }
});

// Network-first strategy: try network, fall back to cache
async function networkFirst(request) {
    try {
        const response = await fetch(request);

        // Cache successful API responses
        if (response.ok) {
            const cache = await caches.open(API_CACHE);
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);

        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }

        // Return offline response for API failures
        return new Response(
            JSON.stringify({ error: 'Offline - cached data unavailable' }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            }
        );
    }
}

// Cache-first strategy: try cache, fall back to network
async function cacheFirstWithFallback(request) {
    const cached = await caches.match(request);

    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);

        if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[SW] Network and cache failed:', request.url);

        // Return offline fallback page
        return new Response(
            '<!DOCTYPE html><html><body>' +
            '<h1>Offline</h1>' +
            '<p>This page is not available offline. Please check your connection.</p>' +
            '</body></html>',
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                    'Content-Type': 'text/html'
                })
            }
        );
    }
}

// Stale-while-revalidate strategy: return cached, update in background
async function staleWhileRevalidate(request) {
    const cached = await caches.match(request);

    const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE).then((c) => {
                c.put(request, response.clone());
            });
        }
        return response;
    }).catch(() => {
        // Network error, return null
        return null;
    });

    // Return cached immediately, or wait for network
    return cached || fetchPromise;
}

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((cacheNames) => {
            Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        });
    }
});

// Background sync for data updates (if supported)
if ('sync' in self.registration) {
    self.addEventListener('sync', (event) => {
        if (event.tag === 'sync-portfolio') {
            event.waitUntil(syncPortfolioData());
        }
    });
}

async function syncPortfolioData() {
    try {
        // Refresh price data from APIs
        const endpoints = [
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd',
            'https://api.finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY'
        ];

        for (const url of endpoints) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const cache = await caches.open(API_CACHE);
                    cache.put(new Request(url), response.clone());
                }
            } catch (err) {
                console.log('[SW] Sync request failed:', url);
            }
        }
    } catch (err) {
        console.error('[SW] Background sync failed:', err);
    }
}

console.log('[SW] Service Worker loaded successfully');
