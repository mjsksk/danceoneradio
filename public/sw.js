const CACHE_NAME = 'dance-one-radio-v3-' + Date.now();
const STATIC_ASSETS = [
  '/assets/dance-one-logo-DP6h_tTr.png',
  '/assets/hero-bg-B-ZqE77g.jpg',
  '/assets/app-store-badge-new-CVyK0T4N.svg',
  '/assets/google-play-badge-new-DVbUjTfg.svg',
  '/lovable-uploads/72d04e54-23af-4f4a-bf39-efcc6c6b2150.png',
  '/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png',
  '/lovable-uploads/f807b27f-9eaf-4d20-b3f5-4bad24538a4e.png'
];

// Aggressive cache invalidation - clear ALL caches on install
const clearAllCaches = async () => {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
};

// Install event - aggressive cache clearing and new asset caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    clearAllCaches()
      .then(() => caches.open(CACHE_NAME))
      .then((cache) => {
        console.log('Caching static assets with new cache');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache with fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip radio streams and external APIs
  if (event.request.url.includes('myradiostream.com') || 
      event.request.url.includes('api.allorigins.win') ||
      event.request.url.includes('supabase.co/storage') ||
      event.request.url.includes('pagead2.googlesyndication.com')) {
    return;
  }

  // NEVER cache HTML documents - always fetch fresh with cache busting
  if (event.request.destination === 'document' || 
      event.request.headers.get('accept')?.includes('text/html') ||
      event.request.url.includes('.html') ||
      event.request.url.endsWith('/')) {
    
    // Add cache-busting headers and timestamp
    const url = new URL(event.request.url);
    url.searchParams.set('_t', Date.now().toString());
    
    const headers = new Headers({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    event.respondWith(
      fetch(url.toString(), {
        method: event.request.method,
        headers: headers,
        credentials: event.request.credentials,
        cache: 'no-store'
      }).catch(() => {
        // Only fallback for true offline scenarios, not cache issues
        return new Response(`
          <!DOCTYPE html>
          <html><head><title>Offline</title></head>
          <body><h1>You are offline</h1><p>Please check your connection.</p></body>
          </html>
        `, { headers: { 'Content-Type': 'text/html' } });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network and cache for future use
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cache static assets only
            if (event.request.url.includes('/assets/') || 
                event.request.url.includes('/lovable-uploads/') ||
                event.request.url.includes('.css') ||
                event.request.url.includes('.js') ||
                event.request.url.includes('.png') ||
                event.request.url.includes('.jpg') ||
                event.request.url.includes('.svg')) {
              
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          })
          .catch(() => {
            // Fallback for offline scenarios
            if (event.request.destination === 'image') {
              return new Response('', { status: 204 });
            }
          });
      })
  );
});
