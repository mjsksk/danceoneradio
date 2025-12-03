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
    };
    
    window.addEventListener('consentChanged', handleConsentChange);
    return () => window.removeEventListener('consentChanged', handleConsentChange);
  }, []);

  // Intersection Observer for lazy loading with aggressive fallback
  useEffect(() => {
    if (!hasAdConsent || !adRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('📢 GoogleAds: Ad became visible via IntersectionObserver');
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { 
        rootMargin: '800px', // Very aggressive - load ads 800px before they come into view
        threshold: 0 // Trigger as soon as any pixel is visible
      }
    );

    observer.observe(adRef.current);
    
    // Aggressive fallback: If not visible after 1 second, force visibility
    const fallbackTimer = setTimeout(() => {
      console.log('📢 GoogleAds: Forcing visibility via timeout fallback');
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
    if (!isVisible || adPushed || !hasAdConsent) {
      console.log(`📢 GoogleAds: Skipping ad push - visible:${isVisible}, pushed:${adPushed}, consent:${hasAdConsent}`);
      return;
    }

    const pushAd = () => {
      try {
        console.log('📢 GoogleAds: Attempting to push ad for slot:', slot);
        if (window.adsbygoogle) {
          console.log('📢 GoogleAds: adsbygoogle available, pushing ad');
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdPushed(true);
          console.log('📢 GoogleAds: Ad pushed successfully for slot:', slot);
        } else {
          console.error('📢 GoogleAds: window.adsbygoogle not available');
        }
      } catch (err) {
        console.error('📢 GoogleAds error:', err);
      }
    };

    // Small delay to ensure DOM is ready
    console.log('📢 GoogleAds: Scheduling ad push in 100ms');
    const timer = setTimeout(pushAd, 100);
    return () => clearTimeout(timer);
  }, [isVisible, adPushed, hasAdConsent, slot]);

  if (!hasAdConsent) {
    console.log('📢 GoogleAds: No consent for slot:', slot);
    return null; // Don't render anything if no consent - Google Consent Mode handles this
  }

  console.log('📢 GoogleAds: Rendering ad slot:', slot, 'visible:', isVisible, 'pushed:', adPushed);

  return (
    <div className={`my-4 flex justify-center ${className}`}>
      <div className="w-full max-w-4xl">
        <ins 
          ref={adRef}
          className="adsbygoogle"
          style={{ 
            display: 'block',
            minHeight: adPushed ? '90px' : '0px',
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
