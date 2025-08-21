import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseUnit = () => {
  useEffect(() => {
    // Load AdSense script if not already loaded
    const loadAdSenseScript = () => {
      if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4230589452649530';
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
        
        script.onload = () => {
          console.log('AdSense script loaded successfully');
          initializeAd();
        };
        
        script.onerror = () => {
          console.error('Failed to load AdSense script');
        };
      } else {
        // Script already loaded, initialize ad
        initializeAd();
      }
    };

    const initializeAd = () => {
      try {
        // Ensure adsbygoogle array exists
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Wait a bit for the script to fully initialize
        setTimeout(() => {
          try {
            (window.adsbygoogle).push({});
            console.log('AdSense ad unit initialized');
          } catch (err) {
            console.error('AdSense initialization error:', err);
          }
        }, 100);
      } catch (err) {
        console.error('AdSense error:', err);
      }
    };

    // Load script with a small delay to ensure DOM is ready
    setTimeout(loadAdSenseScript, 100);
  }, []);

  return (
    <section className="my-8 flex justify-center">
      <div className="w-full max-w-4xl">
        <ins 
          className="adsbygoogle"
          style={{ 
            display: 'block',
            width: '100%',
            height: '280px'
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