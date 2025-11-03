/**
 * Google Consent Mode v2 Implementation
 * Required for AdSense and Analytics to work properly with GDPR
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Initialize gtag function
function gtag(...args: any[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

/**
 * Set default consent state BEFORE any Google scripts load
 * This must be called as early as possible in the app lifecycle
 */
export const initializeConsentMode = (): void => {
  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = gtag;

  // Set default consent to denied for all categories
  // Google scripts will respect this and not track until updated
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'denied',
    'personalization_storage': 'denied',
    'security_storage': 'granted', // Always granted for security
    'wait_for_update': 500 // Wait 500ms for consent update
  });

  // Enable URL passthrough for analytics
  gtag('set', 'url_passthrough', true);
  
  // Enable ads data redaction when consent is denied
  gtag('set', 'ads_data_redaction', true);
};

/**
 * Update consent state when user makes a choice
 */
export const updateConsentMode = (consent: {
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
}): void => {
  if (!window.gtag) {
    console.warn('gtag not initialized');
    return;
  }

  const consentUpdate = {
    'ad_storage': consent.advertising ? 'granted' : 'denied',
    'ad_user_data': consent.advertising ? 'granted' : 'denied',
    'ad_personalization': consent.advertising ? 'granted' : 'denied',
    'analytics_storage': consent.analytics ? 'granted' : 'denied',
    'functionality_storage': consent.functional ? 'granted' : 'denied',
    'personalization_storage': consent.functional ? 'granted' : 'denied',
  };

  window.gtag('consent', 'update', consentUpdate);
  
  // Push event for tracking consent changes
  window.dataLayer.push({
    'event': 'cookie_consent_update',
    'consent_status': consentUpdate
  });
};
