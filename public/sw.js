const CACHE_NAME = 'dance-one-radio-v4';
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
  return self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Push event received!', event);
  
  let data = { title: 'Dance One Radio', body: 'New update available!' };

  if (event.data) {
    try {
      const rawText = event.data.text();
      console.log('🔔 Push raw data:', rawText);
      data = JSON.parse(rawText);
      console.log('🔔 Push parsed data:', JSON.stringify(data));
    } catch (e) {
      console.error('🔔 Push parse error:', e);
      data.body = event.data.text();
    }
  } else {
    console.log('🔔 Push event has no data');
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.png',
    badge: data.badge || '/favicon.png',
    tag: data.tag || 'dance-one-notification-' + Date.now(),
    requireInteraction: data.requireInteraction || false,
    data: { url: data.url || '/' },
  };

  console.log('🔔 Showing notification:', data.title, JSON.stringify(options));

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => console.log('🔔 Notification shown successfully'))
      .catch((err) => console.error('🔔 showNotification failed:', err))
  );
});

// Notification click - open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// Fetch event - serve from cache with fallback to network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  if (event.request.url.includes('myradiostream.com') || 
      event.request.url.includes('api.allorigins.win') ||
      event.request.url.includes('supabase.co/storage') ||
      event.request.url.includes('pagead2.googlesyndication.com')) {
    return;
  }

  if (event.request.destination === 'document' || 
      event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) return response;
        
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
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
            if (event.request.destination === 'image') {
              return new Response('', { status: 204 });
            }
          });
      })
  );
});
