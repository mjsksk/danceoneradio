import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseUnit = () => {
  useEffect(() => {
    // Wait for AdSense script to load
    const loadAd = () => {
      try {
        if (window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } else {
          // Retry if AdSense hasn't loaded yet
          setTimeout(loadAd, 100);
        }
      } catch (err) {
        console.error('AdSense error:', err);
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(loadAd, 300);
  }, []);

  return (
    <div className="my-8 flex justify-center">
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
  );
};

export default AdSenseUnit;