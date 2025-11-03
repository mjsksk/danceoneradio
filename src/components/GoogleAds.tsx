import { useEffect, useRef, useState } from 'react';
import { hasConsent } from '@/utils/consentManager';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdsProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  layout?: string;
  layoutKey?: string;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Google AdSense component with lazy loading and consent management
 * Supports both display and video ads
 */
const GoogleAds = ({ 
  slot,
  format = 'auto', 
  layout = '',
  layoutKey = '',
  responsive = true,
  className = '',
  style = {}
}: GoogleAdsProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const [hasAdConsent, setHasAdConsent] = useState(hasConsent('advertising'));
  const [isVisible, setIsVisible] = useState(false);
  const [adPushed, setAdPushed] = useState(false);

  // Listen for consent changes
  useEffect(() => {
    const handleConsentChange = () => {
      const newConsent = hasConsent('advertising');
      setHasAdConsent(newConsent);
      if (newConsent && isVisible && !adPushed) {
        // Reload the page to initialize ads properly after consent
        window.location.reload();
      }
    };
    
    window.addEventListener('consentChanged', handleConsentChange);
    return () => window.removeEventListener('consentChanged', handleConsentChange);
  }, [isVisible, adPushed]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!hasAdConsent || !adRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { 
        rootMargin: '400px',
        threshold: 0.01 
      }
    );

    observer.observe(adRef.current);
    return () => observer.disconnect();
  }, [hasAdConsent]);

  // Push ad to adsbygoogle when visible
  useEffect(() => {
    if (!isVisible || adPushed || !hasAdConsent) return;

    const pushAd = () => {
      try {
        if (window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdPushed(true);
        }
      } catch (err) {
        console.error('AdSense error:', err);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(pushAd, 100);
    return () => clearTimeout(timer);
  }, [isVisible, adPushed, hasAdConsent]);

  if (!hasAdConsent) {
    return (
      <div className={`my-8 flex justify-center ${className}`}>
        <div className="w-full max-w-4xl p-6 text-center bg-card/50 border border-primary/20 rounded-lg">
          <p className="text-sm text-muted-foreground font-['Rajdhani']">
            Enable advertising cookies to support Dance One Radio
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-8 flex justify-center ${className}`}>
      <div className="w-full max-w-4xl">
        <ins 
          ref={adRef}
          className="adsbygoogle"
          style={{ 
            display: 'block',
            minHeight: '280px',
            ...style
          }}
          data-ad-client="ca-pub-4230589452649530"
          data-ad-slot={slot}
          data-ad-format={format}
          data-ad-layout={layout}
          data-ad-layout-key={layoutKey}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
};

export default GoogleAds;
