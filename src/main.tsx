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

        registration.update();

        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch((error) => {
        console.error('📱 Service Worker registration failed:', error);
      });
  });
}
