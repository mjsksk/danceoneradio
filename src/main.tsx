import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeConsentMode } from '@/utils/googleConsentMode'
import { initializeConsentScripts, getConsent } from '@/utils/consentManager'
import { updateConsentMode } from '@/utils/googleConsentMode'

declare const __BUILD_VERSION__: string | undefined;

console.log('🚀 Application starting...');

// CRITICAL: Initialize Google Consent Mode FIRST before any scripts
console.log('🍪 Step 1: Initializing Consent Mode');
initializeConsentMode();

// Then initialize scripts (they will respect consent mode)
console.log('📢 Step 2: Loading Google scripts');
initializeConsentScripts();

// Update consent mode if user has previously given consent
const existingConsent = getConsent();
console.log('🍪 Step 3: Checking existing consent', existingConsent);

if (existingConsent) {
  console.log('🍪 Found existing consent, updating consent mode');
  updateConsentMode({
    analytics: existingConsent.analytics,
    advertising: existingConsent.advertising,
    functional: existingConsent.functional,
  });
} else {
  console.log('🍪 No existing consent found, user will see consent banner');
}

console.log('🚀 Step 4: Rendering React app');
createRoot(document.getElementById("root")!).render(<App />);

// Reveal the prerendered UI now that React has taken over
document.getElementById("root")?.classList.add("app-loaded");


// Register service worker for push notifications and caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    let refreshing = false;
    const hadController = Boolean(navigator.serviceWorker.controller);
    const appBuildVersion = typeof __BUILD_VERSION__ === 'string' ? __BUILD_VERSION__ : 'dev';
    const reloadKey = 'dance-one-radio-update-reload';

    const reloadOnce = (reason: string) => {
      if (!hadController || refreshing) return;
      const marker = `${reason}:${appBuildVersion}`;
      if (sessionStorage.getItem(reloadKey) === marker) return;
      refreshing = true;
      sessionStorage.setItem(reloadKey, marker);
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      reloadOnce('controllerchange');
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SW_ACTIVATED') {
        reloadOnce(`activated-${event.data.version || 'unknown'}`);
      }
    });

    navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(appBuildVersion)}`, {
      updateViaCache: 'none',
    })
      .then((registration) => {
        console.log('📱 Service Worker registered:', registration.scope);

        // If a worker is already waiting from a previous session, activate it now.
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.update();

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            // Activate the new SW as soon as it's installed, whether or not
            // there's already a controller (covers waiting-from-prev-session).
            if (installingWorker.state === 'installed') {
              installingWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        const checkForFreshHtml = async () => {
          if (document.visibilityState === 'hidden') return;
          const currentModule = document.querySelector<HTMLScriptElement>('script[type="module"][src]')?.getAttribute('src');
          if (!currentModule || currentModule.startsWith('/src/')) return;

          try {
            const freshUrl = new URL(window.location.href);
            freshUrl.searchParams.set('__fresh', Date.now().toString());
            const response = await fetch(freshUrl.toString(), {
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache' },
            });
            const html = await response.text();

            if (response.ok && html.includes('<script') && !html.includes(currentModule)) {
              reloadOnce('fresh-html');
            }
          } catch {
            // Ignore transient network failures; service worker update checks still run.
          }
        };

        // Periodic update probe — frequent enough that users do not need hard refreshes.
        setInterval(() => {
          registration.update().catch(() => {});
          checkForFreshHtml();
        }, 5 * 60 * 1000);

        // Check for updates when tab becomes visible, throttled to 5 min.
        let lastVisibilityCheck = 0;
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState !== 'visible') return;
          const now = Date.now();
          if (now - lastVisibilityCheck < 5 * 60 * 1000) return;
          lastVisibilityCheck = now;
          registration.update().catch(() => {});
          checkForFreshHtml();
        });

        checkForFreshHtml();
      })
      .catch((error) => {
        console.error('📱 Service Worker registration failed:', error);
      });
  });
}
