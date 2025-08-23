import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseUnit = () => {
  console.log('🚨 AdSenseUnit component is rendering!');
  
  useEffect(() => {
    console.log('🔥 AdSense component mounted! Time:', new Date().toISOString());
    alert('AdSense component mounted!');
    
    // Check if AdSense script is loaded
    const scripts = document.querySelectorAll('script[src*="adsbygoogle"]');
    console.log('📜 AdSense scripts found:', scripts.length);
    
    // Check if adsbygoogle is available
    console.log('🌐 window.adsbygoogle exists:', !!window.adsbygoogle);
    console.log('🌐 window.adsbygoogle length:', window.adsbygoogle?.length || 0);
    
    // Initialize adsbygoogle array
    window.adsbygoogle = window.adsbygoogle || [];
    console.log('🔧 AdSense array initialized, length:', window.adsbygoogle.length);
    
    // Wait a bit then push the ad
    const timer = setTimeout(() => {
      try {
        console.log('🚀 Pushing ad to AdSense queue...');
        (window.adsbygoogle).push({});
        console.log('✅ AdSense ad pushed to queue successfully');
        console.log('📊 AdSense queue length after push:', window.adsbygoogle.length);
      } catch (error) {
        console.error('❌ AdSense push error:', error);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
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
        
        <div className="mt-4 bg-muted/10 border border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Advertisement Placeholder</p>
          <p className="text-xs text-muted-foreground/70 mt-2">Check console for AdSense logs</p>
        </div>
      </div>
    </section>
  );
};

export default AdSenseUnit;