import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseUnit = () => {
  useEffect(() => {
    console.log('🚀 AdSense component mounted!');
    
    // Initialize adsbygoogle array
    window.adsbygoogle = window.adsbygoogle || [];
    
    // Push the ad
    try {
      (window.adsbygoogle).push({});
      console.log('✅ AdSense ad pushed to queue');
    } catch (error) {
      console.error('❌ AdSense error:', error);
    }
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