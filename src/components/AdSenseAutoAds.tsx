import { useEffect } from 'react';
import { hasConsent } from '@/utils/consentManager';

// Auto ads component for automatic ad placement by Google
const AdSenseAutoAds = () => {
  useEffect(() => {
    if (!hasConsent('advertising')) return;

    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4230589452649530';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    // Enable auto ads
    script.setAttribute('data-ad-client', 'ca-pub-4230589452649530');
    script.setAttribute('data-ad-frequency-hint', '30s');
    
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript) existingScript.remove();
    };
  }, []);

  return null;
};

export default AdSenseAutoAds;
