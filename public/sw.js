const CACHE_NAME = 'dance-one-radio-v8';
console.log('🔔 Service Worker loaded: v8');
const STATIC_ASSETS = [
  '/assets/dance-one-logo-DP6h_tTr.png',
  '/assets/hero-bg-B-ZqE77g.jpg',
  '/assets/app-store-badge-new-CVyK0T4N.svg',
  '/assets/google-play-badge-new-DVbUjTfg.svg',
  '/lovable-uploads/72d04e54-23af-4f4a-bf39-efcc6c6b2150.png',
  '/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png',
  '/lovable-uploads/f807b27f-9eaf-4d20-b3f5-4bad24538a4e.png'
];

const CACHEABLE_ASSET_PATTERN = /\.(?:css|js|png|jpg|jpeg|svg|webp|gif|woff2?)$/i;

function isCacheableAsset(requestUrl) {
  const url = new URL(requestUrl);
  return url.origin === self.location.origin && (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/lovable-uploads/') ||
    CACHEABLE_ASSET_PATTERN.test(url.pathname)
  );
}

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

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Push event received!');
  console.log('🔔 Has data:', !!event.data);
  console.log('🔔 Notification permission:', self.Notification?.permission || 'unknown');
  
  const defaultTitle = 'Dance One Radio';
  const defaultBody = 'New update available!';
  let title = defaultTitle;
  let body = defaultBody;
  let icon = '/favicon.png';
  let badge = '/favicon.png';
  let url = '/';

  if (event.data) {
    try {
      const rawText = event.data.text();
      console.log('🔔 Push raw text length:', rawText?.length, 'content:', rawText?.substring(0, 200));
      
      if (rawText && rawText.length > 0) {
        try {
          const parsed = JSON.parse(rawText);
          console.log('🔔 Push parsed JSON:', JSON.stringify(parsed));
          title = parsed.title || defaultTitle;
          body = parsed.body || parsed.message || defaultBody;
          icon = parsed.icon || icon;
          badge = parsed.badge || badge;
          url = parsed.url || url;
        } catch (jsonErr) {
          console.log('🔔 Not JSON, using as plain text body');
          body = rawText;
        }
      } else {
        console.log('🔔 Push data is empty, using defaults');
      }
    } catch (e) {
      console.error('🔔 Push data read failed:', e.message || e);
    }
  } else {
    console.log('🔔 Push event has no data, using defaults');
  }

  const options = {
    body: body,
    icon: icon,
    badge: badge,
    tag: 'dance-one-notification-' + Date.now(),
    requireInteraction: true,
    data: { url: url },
  };

  console.log('🔔 Calling showNotification with title:', title);

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('🔔 Notification shown successfully'))
      .catch((err) => console.error('🔔 showNotification FAILED:', err.message || err))
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
  const acceptsHtml = event.request.headers.get('accept')?.includes('text/html');
  
  if (event.request.url.includes('myradiostream.com') || 
      event.request.url.includes('api.allorigins.win') ||
      event.request.url.includes('supabase.co/storage') ||
      event.request.url.includes('pagead2.googlesyndication.com')) {
    return;
  }

  if (event.request.mode === 'navigate' || event.request.destination === 'document' || acceptsHtml) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(async () => {
        return caches.match('/') || caches.match('/index.html');
      })
    );
    return;
  }

  if (!isCacheableAsset(event.request.url)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        if (event.request.destination === 'image') {
          return new Response('', { status: 204 });
        }

        throw new Error(`Network request failed for ${event.request.url}`);
      })
  );
});
