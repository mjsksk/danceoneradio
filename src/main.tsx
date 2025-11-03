import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeConsentMode } from '@/utils/googleConsentMode'
import { initializeConsentScripts, getConsent } from '@/utils/consentManager'
import { updateConsentMode } from '@/utils/googleConsentMode'

// CRITICAL: Initialize Google Consent Mode FIRST before any scripts
initializeConsentMode();

// Then initialize scripts (they will respect consent mode)
initializeConsentScripts();

// Update consent mode if user has previously given consent
const existingConsent = getConsent();
if (existingConsent) {
  updateConsentMode({
    analytics: existingConsent.analytics,
    advertising: existingConsent.advertising,
    functional: existingConsent.functional,
  });
}

createRoot(document.getElementById("root")!).render(<App />);
