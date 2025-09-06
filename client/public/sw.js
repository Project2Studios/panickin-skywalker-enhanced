const CACHE_NAME = 'panickin-skywalker-v1.0.0';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMAGE_CACHE = 'images-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add critical CSS and JS files here when available
];

// Image domains to cache
const IMAGE_DOMAINS = [
  'images.unsplash.com',
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;
  
  // Skip non-GET requests
  if (method !== 'GET') return;
  
  // Skip chrome-extension requests
  if (url.startsWith('chrome-extension://')) return;
  
  // Handle different types of requests
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isFontRequest(request)) {
    event.respondWith(handleFontRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handleHTMLRequest(request));
  }
});

// Image request handler - Cache first strategy
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Image request failed:', error);
    return new Response('Image not available', { status: 404 });
  }
}

// API request handler - Network first with fallback
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for API request');
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ error: 'Network unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Font request handler - Cache first
async function handleFontRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Font request failed:', error);
    return new Response('Font not available', { status: 404 });
  }
}

// Static asset handler - Stale while revalidate
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const networkResponse = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cachedResponse || networkResponse;
}

// HTML request handler - Network first with cache fallback
async function handleHTMLRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, serving from cache');
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to index.html for SPA routing
    const indexResponse = await cache.match('/');
    if (indexResponse) {
      return indexResponse;
    }
    
    return new Response('Page not available offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Helper functions
function isImageRequest(request) {
  const url = new URL(request.url);\n  return request.destination === 'image' || \n         IMAGE_DOMAINS.some(domain => url.hostname.includes(domain)) ||\n         /\\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname);\n}\n\nfunction isAPIRequest(request) {\n  const url = new URL(request.url);\n  return url.pathname.startsWith('/api/');\n}\n\nfunction isFontRequest(request) {\n  return request.destination === 'font' ||\n         /\\.(woff|woff2|ttf|eot)$/i.test(request.url) ||\n         request.url.includes('fonts.googleapis.com') ||\n         request.url.includes('fonts.gstatic.com');\n}\n\nfunction isStaticAsset(request) {\n  return request.destination === 'script' ||\n         request.destination === 'style' ||\n         /\\.(js|css|json)$/i.test(request.url);\n}\n\n// Background sync for offline actions\nself.addEventListener('sync', (event) => {\n  console.log('[SW] Background sync triggered:', event.tag);\n  \n  if (event.tag === 'newsletter-signup') {\n    event.waitUntil(syncNewsletterSignups());\n  }\n});\n\n// Handle newsletter signups when back online\nasync function syncNewsletterSignups() {\n  try {\n    const cache = await caches.open(DYNAMIC_CACHE);\n    const requests = await cache.keys();\n    \n    for (const request of requests) {\n      if (request.url.includes('/api/newsletter/signup') && request.method === 'POST') {\n        try {\n          const response = await fetch(request);\n          if (response.ok) {\n            await cache.delete(request);\n            console.log('[SW] Newsletter signup synced successfully');\n          }\n        } catch (error) {\n          console.error('[SW] Failed to sync newsletter signup:', error);\n        }\n      }\n    }\n  } catch (error) {\n    console.error('[SW] Background sync failed:', error);\n  }\n}\n\n// Handle push notifications\nself.addEventListener('push', (event) => {\n  console.log('[SW] Push notification received');\n  \n  const options = {\n    body: event.data ? event.data.text() : 'New update from Panickin\\' Skywalker!',\n    icon: '/icon-192x192.png',\n    badge: '/icon-72x72.png',\n    vibrate: [200, 100, 200],\n    data: {\n      url: '/',\n      timestamp: Date.now()\n    },\n    actions: [\n      {\n        action: 'view',\n        title: 'View',\n        icon: '/icon-32x32.png'\n      },\n      {\n        action: 'close',\n        title: 'Close',\n        icon: '/icon-32x32.png'\n      }\n    ]\n  };\n  \n  event.waitUntil(\n    self.registration.showNotification('Panickin\\' Skywalker', options)\n  );\n});\n\n// Handle notification clicks\nself.addEventListener('notificationclick', (event) => {\n  console.log('[SW] Notification clicked');\n  \n  event.notification.close();\n  \n  if (event.action === 'view') {\n    event.waitUntil(\n      clients.openWindow(event.notification.data.url || '/')\n    );\n  }\n});\n\n// Cache management - periodic cleanup\nself.addEventListener('message', (event) => {\n  if (event.data && event.data.type === 'CACHE_CLEANUP') {\n    event.waitUntil(performCacheCleanup());\n  }\n});\n\nasync function performCacheCleanup() {\n  try {\n    const cacheNames = await caches.keys();\n    const imageCache = await caches.open(IMAGE_CACHE);\n    const requests = await imageCache.keys();\n    \n    // Remove old image cache entries (keep last 50)\n    if (requests.length > 50) {\n      const oldRequests = requests.slice(0, requests.length - 50);\n      await Promise.all(\n        oldRequests.map(request => imageCache.delete(request))\n      );\n      console.log(`[SW] Cleaned up ${oldRequests.length} old image cache entries`);\n    }\n  } catch (error) {\n    console.error('[SW] Cache cleanup failed:', error);\n  }\n}\n\n// Error handling\nself.addEventListener('error', (event) => {\n  console.error('[SW] Service Worker error:', event.error);\n});\n\nself.addEventListener('unhandledrejection', (event) => {\n  console.error('[SW] Unhandled promise rejection:', event.reason);\n  event.preventDefault();\n});"}]