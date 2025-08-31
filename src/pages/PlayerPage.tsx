import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LiveRadioPlayer from '@/components/LiveRadioPlayer';
import { RadioStreamService } from '@/utils/RadioStreamService';
import stationLogo from '@/assets/dance-one-logo.png';

const PlayerPage = () => {
  const [searchParams] = useSearchParams();
  const [streamTitle, setStreamTitle] = useState('🎵 Dance One Radio - Live Stream 🎵');
  
  // Get URL parameters (for future enhancement)
  const radioPlayer = searchParams.get('radio_player');
  const index = searchParams.get('index');

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

    // Fetch immediately
    fetchStreamMetadata();

    // Update every 2 seconds for real-time updates (less frequent for popup)
    const interval = setInterval(fetchStreamMetadata, 2000);
    return () => clearInterval(interval);
  }, []);

  // Set document title for popup window
  useEffect(() => {
    document.title = 'Dance One Radio - Live Player';
    
    // Add meta viewport for responsive design
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex flex-col">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex items-center gap-3">
        <img 
          src={stationLogo} 
          alt="Dance One Radio" 
          className="h-8 w-8 object-contain"
        />
        <div>
          <h1 className="text-lg font-bold text-primary">Dance One Radio</h1>
          <p className="text-xs text-muted-foreground">Live Stream Player</p>
        </div>
      </header>

      {/* Main Player Content */}
      <main className="flex-1 p-4 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <LiveRadioPlayer 
            streamUrls={[
              "http://s9.myradiostream.com:14296/;", 
              "http://s9.myradiostream.com:14296/stream", 
              "http://s9.myradiostream.com:14296", 
              "https://live-radio-stream.online/dance-one-radio.mp3"
            ]} 
            streamTitle={streamTitle} 
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card/80 backdrop-blur-sm border-t border-border/50 p-3 text-center">
        <p className="text-xs text-muted-foreground">
          Visit <a href="https://danceoneradio.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">danceoneradio.com</a>
        </p>
      </footer>
    </div>
  );
};

export default PlayerPage;