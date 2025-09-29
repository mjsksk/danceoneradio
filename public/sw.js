const CACHE_NAME = 'dance-one-radio-v2';
const STATIC_ASSETS = [
  '/assets/dance-one-logo-DP6h_tTr.png',
  '/assets/hero-bg-B-ZqE77g.jpg',
  '/assets/app-store-badge-new-CVyK0T4N.svg',
  '/assets/google-play-badge-new-DVbUjTfg.svg',
  '/lovable-uploads/72d04e54-23af-4f4a-bf39-efcc6c6b2150.png',
  '/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png',
  '/lovable-uploads/f807b27f-9eaf-4d20-b3f5-4bad24538a4e.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
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

  // Always fetch fresh HTML documents (SPA routes)
  if (event.request.destination === 'document' || 
      event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Fallback to cached index.html for SPA routing
        return caches.match('/index.html') || caches.match('/');
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
