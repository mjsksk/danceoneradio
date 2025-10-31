import { useEffect, useState } from 'react';
import { hasConsent } from '@/utils/consentManager';

// Auto ads component for automatic ad placement by Google
const AdSenseAutoAds = () => {
  const [hasAdConsent, setHasAdConsent] = useState(hasConsent('advertising'));

  // Listen for consent changes
  useEffect(() => {
    const handleConsentChange = () => {
      const newConsent = hasConsent('advertising');
      console.log('AdSense: Consent changed, advertising:', newConsent);
      setHasAdConsent(newConsent);
    };
    
    window.addEventListener('consentChanged', handleConsentChange);
    return () => window.removeEventListener('consentChanged', handleConsentChange);
  }, []);

  useEffect(() => {
    if (!hasAdConsent) return;

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (existingScript) {
      console.log('AdSense: Script already loaded');
      return;
    }

    console.log('AdSense: Loading script');
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4230589452649530';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    // Enable auto ads
    script.setAttribute('data-ad-client', 'ca-pub-4230589452649530');
    script.setAttribute('data-ad-frequency-hint', '30s');
    
    script.onload = () => {
      console.log('AdSense: Script loaded successfully');
    };
    
    script.onerror = () => {
      console.error('AdSense: Failed to load script');
    };
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector(`script[src="${script.src}"]`);
      if (scriptToRemove) {
        console.log('AdSense: Removing script');
        scriptToRemove.remove();
      }
    };
  }, [hasAdConsent]);

  return null;
};

export default AdSenseAutoAds;
