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
 * Only shows space when actual ad content is detected
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
  const [hasAdContent, setHasAdContent] = useState(false);

  // Listen for consent changes
  useEffect(() => {
    const handleConsentChange = () => {
      const newConsent = hasConsent('advertising');
      setHasAdConsent(newConsent);
    };
    
    window.addEventListener('consentChanged', handleConsentChange);
    return () => window.removeEventListener('consentChanged', handleConsentChange);
  }, []);

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
        rootMargin: '800px',
        threshold: 0
      }
    );

    observer.observe(adRef.current);
    
    // Fallback: If not visible after 1 second, force visibility
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
      observer.disconnect();
    }, 1000);
    
    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
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
        console.error('GoogleAds error:', err);
      }
    };

    const timer = setTimeout(pushAd, 100);
    return () => clearTimeout(timer);
  }, [isVisible, adPushed, hasAdConsent, slot]);

  // Detect actual ad content using MutationObserver and height check
  useEffect(() => {
    if (!adPushed || !adRef.current) return;

    const checkForAdContent = () => {
      if (!adRef.current) return false;
      
      // Check if the ad element has actual content (height > 0 or has children)
      const rect = adRef.current.getBoundingClientRect();
      const hasChildren = adRef.current.children.length > 0;
      const hasHeight = rect.height > 10;
      
      return hasChildren || hasHeight;
    };

    // Check immediately
    if (checkForAdContent()) {
      setHasAdContent(true);
      return;
    }

    // Use MutationObserver to detect when Google injects ad content
    const observer = new MutationObserver(() => {
      if (checkForAdContent()) {
        setHasAdContent(true);
        observer.disconnect();
      }
    });

    observer.observe(adRef.current, {
      childList: true,
      subtree: true,
      attributes: true
    });

    // Also check periodically for height changes (some ads load async)
    const intervalId = setInterval(() => {
      if (checkForAdContent()) {
        setHasAdContent(true);
        clearInterval(intervalId);
        observer.disconnect();
      }
    }, 500);

    // Stop checking after 5 seconds - ad won't load
    const timeout = setTimeout(() => {
      clearInterval(intervalId);
      observer.disconnect();
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [adPushed]);

  if (!hasAdConsent) {
    return null;
  }

  // Only render visible container when actual ad content is detected
  return (
    <div 
      className={`flex justify-center transition-all duration-300 ${hasAdContent ? 'my-4 ' + className : ''}`}
      style={{ 
        height: hasAdContent ? 'auto' : '0px',
        overflow: hasAdContent ? undefined : 'hidden',
        margin: hasAdContent ? undefined : '0px',
        padding: hasAdContent ? undefined : '0px',
        opacity: hasAdContent ? 1 : 0,
        pointerEvents: hasAdContent ? undefined : 'none',
      }}
    >
      <div className="w-full max-w-4xl">
        <ins 
          ref={adRef}
          className="adsbygoogle"
          style={{ 
            display: 'block',
            minHeight: hasAdContent ? '90px' : '0px',
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
