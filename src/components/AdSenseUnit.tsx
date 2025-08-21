import { useEffect, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseUnit = () => {
  const [adStatus, setAdStatus] = useState<'loading' | 'loaded' | 'error' | 'blocked'>('loading');
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');

  useEffect(() => {
    let mounted = true;

    const checkAdBlocker = () => {
      // Simple ad blocker detection
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.position = 'absolute';
      testAd.style.left = '-999px';
      document.body.appendChild(testAd);
      
      setTimeout(() => {
        if (testAd.offsetHeight === 0) {
          if (mounted) {
            setAdStatus('blocked');
            setDebugInfo('Ad blocker detected');
          }
        }
        document.body.removeChild(testAd);
      }, 100);
    };

    const loadAdSenseScript = () => {
      if (!mounted) return;
      
      setDebugInfo('Loading AdSense script...');
      
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
      if (existingScript) {
        setDebugInfo('AdSense script already loaded');
        initializeAd();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4230589452649530';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        if (mounted) {
          setDebugInfo('AdSense script loaded successfully');
          console.log('✅ AdSense script loaded');
          initializeAd();
        }
      };
      
      script.onerror = () => {
        if (mounted) {
          setAdStatus('error');
          setDebugInfo('Failed to load AdSense script');
          console.error('❌ Failed to load AdSense script');
        }
      };

      document.head.appendChild(script);
    };

    const initializeAd = () => {
      if (!mounted) return;
      
      try {
        setDebugInfo('Initializing ad unit...');
        
        // Ensure adsbygoogle array exists
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Wait for DOM and script to be ready
        setTimeout(() => {
          if (!mounted) return;
          
          try {
            (window.adsbygoogle).push({});
            setAdStatus('loaded');
            setDebugInfo('Ad unit initialized');
            console.log('✅ AdSense ad unit initialized');
            
            // Check if ad actually loaded after some time
            setTimeout(() => {
              if (!mounted) return;
              const adElement = document.querySelector('.adsbygoogle');
              if (adElement && adElement.getAttribute('data-adsbygoogle-status') !== 'done') {
                setDebugInfo('Ad unit initialized but no ad content loaded');
                console.log('⚠️ AdSense: No ad content loaded (normal for dev/unapproved sites)');
              }
            }, 3000);
            
          } catch (err) {
            if (mounted) {
              setAdStatus('error');
              setDebugInfo(`Initialization error: ${err}`);
              console.error('❌ AdSense initialization error:', err);
            }
          }
        }, 500);
      } catch (err) {
        if (mounted) {
          setAdStatus('error');
          setDebugInfo(`Error: ${err}`);
          console.error('❌ AdSense error:', err);
        }
      }
    };

    // Check for ad blockers first
    checkAdBlocker();
    
    // Load AdSense script
    setTimeout(loadAdSenseScript, 100);

    return () => {
      mounted = false;
    };
  }, []);

  // Show placeholder content while ads are loading or if there's an issue
  const renderPlaceholder = () => {
    switch (adStatus) {
      case 'blocked':
        return (
          <div className="bg-muted/20 border border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">Ad content blocked</p>
            <p className="text-sm text-muted-foreground/70 mt-2">Please disable ad blocker to support the site</p>
          </div>
        );
      case 'error':
        return (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 text-center">
            <p className="text-destructive">Ad loading error</p>
            <p className="text-sm text-muted-foreground mt-2">{debugInfo}</p>
          </div>
        );
      default:
        return (
          <div className="bg-muted/10 border border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">Advertisement</p>
            <p className="text-xs text-muted-foreground/70 mt-2">{debugInfo}</p>
          </div>
        );
    }
  };

  return (
    <section className="my-8 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* AdSense ad unit */}
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
        
        {/* Debug info and placeholder (only show if no real ad is loaded) */}
        {adStatus !== 'loaded' && (
          <div className="mt-4">
            {renderPlaceholder()}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdSenseUnit;