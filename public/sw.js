const CACHE_NAME = 'dance-one-radio-v11';
const APP_CACHE_PREFIX = 'dance-one-radio-';
console.log('🔔 Service Worker loaded: v11');
// Only precache STABLE paths. Hashed /assets/* files are picked up on demand
// by the runtime fetch handler; listing them by name here would 404 on every
// new deploy and reject the entire install, leaving users stuck on the old SW.
const STATIC_ASSETS = [
  '/favicon.png',
  '/lovable-uploads/72d04e54-23af-4f4a-bf39-efcc6c6b2150.png',
  '/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png',
  '/lovable-uploads/f807b27f-9eaf-4d20-b3f5-4bad24538a4e.png'
];

const CACHEABLE_ASSET_PATTERN = /\.(?:png|jpg|jpeg|svg|webp|gif|woff2?)$/i;

function isWorkboxCacheForThisRegistration(name) {
  const hasWorkboxBucket = /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name);
  return hasWorkboxBucket && name.endsWith(self.registration.scope);
}

function isCacheableAsset(requestUrl) {
  const url = new URL(requestUrl);
  return url.origin === self.location.origin && (
    (url.pathname.startsWith('/assets/') && CACHEABLE_ASSET_PATTERN.test(url.pathname)) ||
    (url.pathname.startsWith('/lovable-uploads/') && CACHEABLE_ASSET_PATTERN.test(url.pathname)) ||
    CACHEABLE_ASSET_PATTERN.test(url.pathname)
  );
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Per-URL allSettled so a single 404 cannot reject the whole install.
      Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.log('SW precache skip:', url, err?.message || err);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

// Activate event - clean up old caches and notify clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.allSettled(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            (cacheName.startsWith(APP_CACHE_PREFIX) || isWorkboxCacheForThisRegistration(cacheName))
          ) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve(false);
        })
      );
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_NAME });
      }
    })()
  );
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
    // Force a real origin fetch, bypassing HTTP cache AND any CDN edge cache
    // by appending a cache-buster and sending no-cache headers.
    const bustUrl = new URL(event.request.url);
    bustUrl.searchParams.set('__nc', Date.now().toString());
    const bustedRequest = new Request(bustUrl.toString(), {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
      mode: 'same-origin',
      credentials: 'same-origin',
      redirect: 'follow',
    });
    event.respondWith(
      fetch(bustedRequest, { cache: 'no-store' })
        .then((response) => {
          // Strip cache headers from the response the browser stores.
          const headers = new Headers(response.headers);
          headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
          headers.set('Pragma', 'no-cache');
          headers.set('Expires', '0');
          return response.blob().then((body) =>
            new Response(body, { status: response.status, statusText: response.statusText, headers })
          );
        })
        .catch(() =>
          new Response('Dance One Radio is temporarily offline. Please reconnect and refresh.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        )
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
