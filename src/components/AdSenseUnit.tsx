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
    console.log('🚀 AdSense component mounted, starting initialization...');

    const checkAdBlocker = () => {
      console.log('🔍 Checking for ad blockers...');
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.position = 'absolute';
      testAd.style.left = '-999px';
      testAd.style.height = '1px';
      testAd.style.width = '1px';
      document.body.appendChild(testAd);
      
      setTimeout(() => {
        try {
          if (testAd.offsetHeight === 0 || testAd.style.display === 'none') {
            if (mounted) {
              console.log('🚫 Ad blocker detected');
              setAdStatus('blocked');
              setDebugInfo('Ad blocker detected');
            }
          } else {
            console.log('✅ No ad blocker detected');
          }
          if (testAd.parentNode) {
            document.body.removeChild(testAd);
          }
        } catch (e) {
          console.log('⚠️ Ad blocker check failed:', e);
        }
      }, 100);
    };

    const initializeAd = () => {
      if (!mounted) return;
      
      console.log('🎯 Initializing AdSense ad unit...');
      setDebugInfo('Initializing ad unit...');
      
      try {
        // Ensure adsbygoogle array exists
        window.adsbygoogle = window.adsbygoogle || [];
        console.log('📝 adsbygoogle array initialized');
        
        // Push ad configuration
        setTimeout(() => {
          if (!mounted) return;
          
          try {
            console.log('📤 Pushing ad config to adsbygoogle...');
            (window.adsbygoogle).push({});
            setAdStatus('loaded');
            setDebugInfo('Ad unit pushed to queue');
            console.log('✅ AdSense ad unit pushed to queue');
            
            // Check ad status after delay
            setTimeout(() => {
              if (!mounted) return;
              const adElement = document.querySelector('.adsbygoogle[data-ad-client="ca-pub-4230589452649530"]');
              if (adElement) {
                const status = adElement.getAttribute('data-adsbygoogle-status');
                console.log('📊 Ad element status:', status);
                if (status === 'done') {
                  setDebugInfo('Ad successfully loaded');
                  console.log('🎉 Ad content loaded successfully');
                } else {
                  setDebugInfo('Ad initialized but no content (normal in dev/unapproved sites)');
                  console.log('⚠️ Ad initialized but no content loaded - this is normal for development or unapproved sites');
                }
              } else {
                console.log('❌ Ad element not found');
              }
            }, 2000);
            
          } catch (err) {
            if (mounted) {
              console.error('❌ AdSense push error:', err);
              setAdStatus('error');
              setDebugInfo(`Push error: ${err}`);
            }
          }
        }, 100);
      } catch (err) {
        if (mounted) {
          console.error('❌ AdSense initialization error:', err);
          setAdStatus('error');
          setDebugInfo(`Error: ${err}`);
        }
      }
    };

    const loadAdSenseScript = () => {
      if (!mounted) return;
      
      console.log('📜 Loading AdSense script...');
      setDebugInfo('Loading AdSense script...');
      
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
      if (existingScript) {
        console.log('✅ AdSense script already exists, initializing...');
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
          console.log('✅ AdSense script loaded successfully');
          setDebugInfo('AdSense script loaded successfully');
          initializeAd();
        }
      };
      
      script.onerror = () => {
        if (mounted) {
          console.error('❌ Failed to load AdSense script');
          setAdStatus('error');
          setDebugInfo('Failed to load AdSense script');
        }
      };

      document.head.appendChild(script);
      console.log('📜 AdSense script tag added to head');
    };

    // Start the process
    checkAdBlocker();
    loadAdSenseScript();

    return () => {
      console.log('🔄 AdSense component unmounting...');
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