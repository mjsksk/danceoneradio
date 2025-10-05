import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseUnit = () => {
  const adRef = useRef<HTMLModElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const adLoadedRef = useRef<boolean>(false);
  const adInitializedRef = useRef<boolean>(false);
  const [hasAdContent, setHasAdContent] = useState<boolean>(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (!adRef.current || adLoadedRef.current || adInitializedRef.current) return;

    // Check if ad is already loaded by checking for existing content
    if (adRef.current.innerHTML.trim() !== '') {
      adLoadedRef.current = true;
      return;
    }

    adInitializedRef.current = true;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !adLoadedRef.current && adRef.current) {
            // Double-check that the ad hasn't been loaded yet
            if (adRef.current.innerHTML.trim() !== '') {
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
                  (window.adsbygoogle).push({});
                  adRef.current.setAttribute('data-ad-status', 'loaded');
                  
                  // Check if ad content loaded after a short delay
                  setTimeout(() => {
                    if (adRef.current && adRef.current.innerHTML.trim() !== '') {
                      setHasAdContent(true);
                    }
                  }, 1500);
                }
              } catch (error) {
                console.error('AdSense error:', error);
                // Reset state on error to allow retry
                adLoadedRef.current = false;
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

    observerRef.current.observe(adRef.current);

    return () => {
      observerRef.current?.disconnect();
      adInitializedRef.current = false;
    };
  }, []);

  // Don't render the container if no ad content after initialization
  if (adLoadedRef.current && !hasAdContent) {
    return null;
  }

  return (
    <section className="my-8 flex justify-center">
      <div 
        className="w-full max-w-4xl"
        style={{ 
          contain: 'layout style paint',
          contentVisibility: 'auto',
          minHeight: hasAdContent ? '280px' : '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          willChange: 'auto',
          transition: 'min-height 0.3s ease'
        }}
      >
        <ins 
          ref={adRef}
          className="adsbygoogle"
          style={{ 
            display: 'block',
            width: '100%',
            height: '280px',
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