import { useEffect, useRef, useState } from 'react';
import { hasConsent } from '@/utils/consentManager';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSenseUnitProps {
  slot?: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal' | 'fluid';
  layout?: 'in-article' | 'in-feed' | '';
  className?: string;
  style?: React.CSSProperties;
}

const AdSenseUnit = ({ 
  slot = '6777392184', 
  format = 'auto', 
  layout = '',
  className = '',
  style = {}
}: AdSenseUnitProps) => {
  const [hasAdConsent, setHasAdConsent] = useState(hasConsent('advertising'));
  const adRef = useRef<HTMLModElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Listen for consent changes
  useEffect(() => {
    const handleConsentChange = () => {
      setHasAdConsent(hasConsent('advertising'));
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
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { 
        rootMargin: '200px', // Load 200px before visible
        threshold: 0.01 
      }
    );

    observer.observe(adRef.current);
    return () => observer.disconnect();
  }, [hasAdConsent, isVisible]);

  // Load ad when visible
  useEffect(() => {
    if (!isVisible || isLoaded || !adRef.current) return;

    const loadAd = () => {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        setIsLoaded(true);
      } catch (err) {
        console.error('AdSense error:', err);
      }
    };

    // Wait for script to be available
    if (window.adsbygoogle) {
      loadAd();
    } else {
      const checkScript = setInterval(() => {
        if (window.adsbygoogle) {
          clearInterval(checkScript);
          loadAd();
        }
      }, 100);
      return () => clearInterval(checkScript);
    }
  }, [isVisible, isLoaded]);

  if (!hasAdConsent) {
    return (
      <div className={`my-8 flex justify-center ${className}`}>
        <div className="w-full max-w-4xl p-6 text-center bg-card/50 border border-primary/20 rounded-lg">
          <p className="text-sm text-muted-foreground font-['Rajdhani']">
            Enable ads in Cookie Settings to support us
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
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default AdSenseUnit;
