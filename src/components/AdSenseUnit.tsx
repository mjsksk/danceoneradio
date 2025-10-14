import { useEffect, useRef, useState } from 'react';
import { hasConsent } from '@/utils/consentManager';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseUnit = () => {
  const [hasAdConsent, setHasAdConsent] = useState(hasConsent('advertising'));
  const adRef = useRef<HTMLModElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const adLoadedRef = useRef<boolean>(false);
  const adInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    // Listen for consent changes
    const handleConsentChange = () => {
      const newConsent = hasConsent('advertising');
      console.log('🍪 AdSense: Consent changed, advertising consent:', newConsent);
      setHasAdConsent(newConsent);
      
      // Reset ad state when consent is granted to allow reinitialization
      if (newConsent && !adLoadedRef.current) {
        console.log('🍪 AdSense: Resetting ad state for reinitialization');
        adLoadedRef.current = false;
        adInitializedRef.current = false;
      }
    };

    window.addEventListener('consentChanged', handleConsentChange);
    return () => {
      window.removeEventListener('consentChanged', handleConsentChange);
    };
  }, []);

  useEffect(() => {
    // Don't load ads if no consent
    if (!hasAdConsent) {
      console.log('🍪 AdSense: No advertising consent, skipping ad load');
      return;
    }

    // Prevent multiple initializations
    if (!adRef.current || adLoadedRef.current || adInitializedRef.current) {
      console.log('🍪 AdSense: Skipping (already loaded or initialized)', {
        hasRef: !!adRef.current,
        loaded: adLoadedRef.current,
        initialized: adInitializedRef.current
      });
      return;
    }

    // Check if ad is already loaded by checking for existing content
    if (adRef.current.innerHTML.trim() !== '') {
      console.log('🍪 AdSense: Ad already has content, marking as loaded');
      adLoadedRef.current = true;
      return;
    }

    console.log('🍪 AdSense: Starting ad initialization');
    adInitializedRef.current = true;

    // Wait for AdSense script to be loaded before initializing
    const waitForAdSenseScript = () => {
      return new Promise<void>((resolve) => {
        const checkScript = () => {
          if (window.adsbygoogle || document.querySelector('script[src*="adsbygoogle.js"]')) {
            console.log('🍪 AdSense: Script is loaded');
            resolve();
          } else {
            console.log('🍪 AdSense: Waiting for script...');
            setTimeout(checkScript, 100);
          }
        };
        checkScript();
      });
    };

    waitForAdSenseScript().then(() => {
      console.log('🍪 AdSense: Setting up IntersectionObserver');
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !adLoadedRef.current && adRef.current) {
              console.log('🍪 AdSense: Ad is visible, attempting to load');
              
              // Double-check that the ad hasn't been loaded yet
              if (adRef.current.innerHTML.trim() !== '') {
                console.log('🍪 AdSense: Ad already has content, skipping');
                adLoadedRef.current = true;
                observerRef.current?.disconnect();
                return;
              }

              adLoadedRef.current = true;
              
              // Initialize adsbygoogle array
              window.adsbygoogle = window.adsbygoogle || [];
              
              // Use requestAnimationFrame to avoid forced reflows
              requestAnimationFrame(() => {
                try {
                  // Only push if the element still exists and hasn't been processed
                  if (adRef.current && !adRef.current.hasAttribute('data-ad-status')) {
                    console.log('🍪 AdSense: Pushing ad to adsbygoogle queue');
                    (window.adsbygoogle).push({});
                    adRef.current.setAttribute('data-ad-status', 'loaded');
                    console.log('✅ AdSense: Ad successfully initialized');
                  }
                } catch (error) {
                  console.error('❌ AdSense error:', error);
                  // Reset state on error to allow retry
                  adLoadedRef.current = false;
                  adInitializedRef.current = false;
                }
              });
              
              // Disconnect observer after loading
              observerRef.current?.disconnect();
            }
          });
        },
        { 
          rootMargin: '100px',
          threshold: 0.1 
        }
      );

      if (adRef.current) {
        observerRef.current.observe(adRef.current);
        console.log('🍪 AdSense: Observer attached to ad element');
      }
    });

    return () => {
      observerRef.current?.disconnect();
      adInitializedRef.current = false;
    };
  }, [hasAdConsent]);

  // If no advertising consent, show a message
  if (!hasAdConsent) {
    return (
      <section className="my-8 flex justify-center">
        <div className="w-full max-w-4xl p-8 text-center bg-card/50 border border-primary/20 rounded-lg">
          <p className="text-muted-foreground font-['Rajdhani']">
            Ads are disabled. You can enable them in Cookie Settings to support our free service.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-8 flex justify-center">
      <div 
        className="w-full max-w-4xl"
        style={{ 
          contain: 'layout style paint',
          contentVisibility: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          willChange: 'auto'
        }}
      >
        <ins 
          ref={adRef}
          className="adsbygoogle"
          style={{ 
            display: 'block',
            width: '100%',
            minHeight: '280px',
            backgroundColor: 'transparent',
            contain: 'layout style',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            perspective: '1000px'
          }}
          data-ad-client="ca-pub-4230589452649530"
          data-ad-slot="6777392184"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </section>
  );
};

export default AdSenseUnit;