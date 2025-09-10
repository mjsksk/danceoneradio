import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseUnit = () => {
  const adRef = useRef<HTMLModElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const adLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    // Use Intersection Observer to load ad only when visible
    if (!adRef.current || adLoadedRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !adLoadedRef.current) {
            adLoadedRef.current = true;
            
            // Initialize adsbygoogle array
            window.adsbygoogle = window.adsbygoogle || [];
            
            // Use requestAnimationFrame to avoid forced reflows
            requestAnimationFrame(() => {
              try {
                (window.adsbygoogle).push({});
              } catch (error) {
                console.error('AdSense error:', error);
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
    };
  }, []);

  return (
    <section className="my-8 flex justify-center">
      <div 
        className="w-full max-w-4xl"
        style={{ 
          contain: 'layout style paint',
          contentVisibility: 'auto',
          minHeight: '280px',
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