import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeConsentMode } from '@/utils/googleConsentMode'
import { initializeConsentScripts, getConsent } from '@/utils/consentManager'
import { updateConsentMode } from '@/utils/googleConsentMode'

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

// Register service worker for push notifications and caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    let refreshing = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker.register('/sw.js')
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

        // Periodic update probe — hourly while tab is open.
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);

        // Check for updates when tab becomes visible, throttled to 5 min.
        let lastVisibilityCheck = 0;
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState !== 'visible') return;
          const now = Date.now();
          if (now - lastVisibilityCheck < 5 * 60 * 1000) return;
          lastVisibilityCheck = now;
          registration.update().catch(() => {});
        });
      })
      .catch((error) => {
        console.error('📱 Service Worker registration failed:', error);
      });
  });
}
