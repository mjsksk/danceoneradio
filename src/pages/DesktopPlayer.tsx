import { useState, useEffect } from 'react';
import LiveRadioPlayer from '@/components/LiveRadioPlayer';
import TracksSection from '@/components/TracksSection';
import SEO from '@/components/SEO';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { useTrackHistoryUpdater } from '@/hooks/useTrackHistoryUpdater';

const DesktopPlayer = () => {
  const [streamTitle, setStreamTitle] = useState('🎵 Dance One Radio - Live Stream 🎵');
  
  // Keep track history updated
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
    document.title = 'Dance One Radio - Desktop Player';
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO 
        title="Dance One Radio - Desktop Player"
        description="Listen to Dance One Radio's live electronic dance music stream"
      />
      
      {/* Player Section */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-primary/20 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <LiveRadioPlayer 
            streamUrls={[
              "http://s9.myradiostream.com:14296/;", 
              "http://s9.myradiostream.com:14296/stream", 
              "http://s9.myradiostream.com:14296", 
              "https://live-radio-stream.online/dance-one-radio.mp3"
            ]} 
            streamTitle={streamTitle}
            hidePopupButton={true}
          />
        </div>
      </div>

      {/* Tracks Section */}
      <main className="container mx-auto px-4">
        <TracksSection />
      </main>
    </div>
  );
};

export default DesktopPlayer;
