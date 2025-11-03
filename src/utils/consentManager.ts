export interface CookieConsent {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
  timestamp: number;
  version: string;
}

const CONSENT_KEY = 'cookie_consent';
const CONSENT_VERSION = '1.0';
const CONSENT_EXPIRY_DAYS = 365; // 12 months

// Check if consent has expired (12 months)
const isConsentExpired = (timestamp: number): boolean => {
  const expiryDate = new Date(timestamp);
  expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);
  return new Date() > expiryDate;
};

// Get stored consent or return null if not set or expired
export const getConsent = (): CookieConsent | null => {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;

    const consent: CookieConsent = JSON.parse(stored);
    
    // Check if consent has expired or version has changed
    if (isConsentExpired(consent.timestamp) || consent.version !== CONSENT_VERSION) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }

    return consent;
  } catch (error) {
    console.error('Error reading consent:', error);
    return null;
  }
};

// Save consent preferences
export const setConsent = (consent: Omit<CookieConsent, 'timestamp' | 'version' | 'necessary'>): void => {
  try {
    const fullConsent: CookieConsent = {
      ...consent,
      necessary: true, // Always true
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };
    
    localStorage.setItem(CONSENT_KEY, JSON.stringify(fullConsent));
    
    // Trigger a custom event so other parts of the app can react
    window.dispatchEvent(new CustomEvent('consentChanged', { detail: fullConsent }));
  } catch (error) {
    console.error('Error saving consent:', error);
  }
};

// Check if user has given consent for a specific category
export const hasConsent = (category: 'necessary' | 'functional' | 'analytics' | 'advertising'): boolean => {
  const consent = getConsent();
  if (!consent) return category === 'necessary'; // Only necessary cookies allowed by default
  return consent[category];
};

// Accept all cookies
export const acceptAll = (): void => {
  setConsent({
    functional: true,
    analytics: true,
    advertising: true,
  });
};

// Reject non-essential cookies
export const rejectNonEssential = (): void => {
  setConsent({
    functional: false,
    analytics: false,
    advertising: false,
  });
};

// Check if consent banner should be shown
export const shouldShowConsent = (): boolean => {
  return getConsent() === null;
};

// Load Google Analytics if consent given
export const loadGoogleAnalytics = (): void => {
  if (!hasConsent('analytics')) return;

  // Check if already loaded
  if (window.gtag) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-PDHB9METW8';
  document.head.appendChild(script);

  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-PDHB9METW8');
  };
};

// Load Google AdSense - always load script, but ads won't display without consent
export const loadGoogleAdSense = (): void => {
  // Check if already loaded
  if (document.querySelector('script[src*="adsbygoogle.js"]')) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4230589452649530';
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
};

// Initialize scripts - always load AdSense script, it will respect consent internally
export const initializeConsentScripts = (): void => {
  if (hasConsent('analytics')) {
    loadGoogleAnalytics();
  }
  // Always load AdSense script so ads can display immediately after consent
  loadGoogleAdSense();
};

// TypeScript declarations for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}
