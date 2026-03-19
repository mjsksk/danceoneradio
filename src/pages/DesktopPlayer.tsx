import { useState, useEffect, lazy, Suspense } from 'react';
import LiveRadioPlayer from '@/components/LiveRadioPlayer';
import { PRIMARY_STREAM_URLS } from '@/config/streamUrls';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { useTrackHistoryUpdater } from '@/hooks/useTrackHistoryUpdater';

const TracksSection = lazy(() => import('@/components/TracksSection'));

const DesktopPlayer = () => {
  const [streamTitle, setStreamTitle] = useState('🎵 Dance One Radio - Live Stream 🎵');
  
  useTrackHistoryUpdater();

  useEffect(() => {
    const fetchStreamMetadata = async () => {
      try {
        const metadata = await RadioStreamService.getStreamMetadata();
        const formattedTitle = RadioStreamService.formatTitle(metadata);
        setStreamTitle(formattedTitle);
      } catch (error) {
        console.error('Error fetching stream metadata:', error);
      }
    };

    fetchStreamMetadata();
    const interval = setInterval(fetchStreamMetadata, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.title = 'Dance One Radio';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-primary/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <LiveRadioPlayer 
            streamUrls={[...PRIMARY_STREAM_URLS]} 
            streamTitle={streamTitle}
            hidePopupButton={true}
          />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Loading recent tracks...</div>}>
          <TracksSection />
        </Suspense>
      </main>
    </div>
  );
};

export default DesktopPlayer;
