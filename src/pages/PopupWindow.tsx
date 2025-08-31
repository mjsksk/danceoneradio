import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Radio } from 'lucide-react';
import stationLogo from '@/assets/dance-one-logo.png';
import { RadioStreamService } from '@/utils/RadioStreamService';

const PopupWindow = () => {
  const [currentTrack, setCurrentTrack] = useState('🎵 Dance One Radio - Live Electronic Music');

  // Fetch stream metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const metadata = await RadioStreamService.getStreamMetadata();
        const formattedTitle = RadioStreamService.formatTitle(metadata);
        setCurrentTrack(formattedTitle);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
    const interval = setInterval(fetchMetadata, 3000);
    return () => clearInterval(interval);
  }, []);

  // Set window title
  useEffect(() => {
    document.title = `🎵 ${currentTrack} - Dance One Radio`;
  }, [currentTrack]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 p-4">
      <Card className="max-w-md mx-auto mt-8 overflow-hidden shadow-2xl border-2">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/90 to-accent/90 p-4 text-primary-foreground">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/20 p-1">
              <img
                src={stationLogo}
                alt="Dance One Radio"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Dance One Radio</h1>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  LIVE
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Radio Player
                </Badge>
              </div>
            </div>
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Now Playing */}
        <div className="p-4 border-b bg-muted/30">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Now Playing</div>
            <div className="text-sm font-medium line-clamp-2 h-10 flex items-center justify-center">
              {currentTrack}
            </div>
          </div>
        </div>

        {/* Radio.co Player */}
        <div className="p-4">
          <div className="border-2 border-primary/20 rounded-lg overflow-hidden bg-muted/10">
            <iframe
              src="https://www.radio.co/player/embed/s2c3cc784b"
              frameBorder="0"
              className="w-full h-40"
              allow="autoplay"
              title="Dance One Radio Player"
            />
          </div>
          
          {/* Instructions */}
          <div className="text-xs text-muted-foreground text-center mt-4 space-y-1">
            <div>Use the play button above to start listening</div>
            <div>Volume and controls are built into the player</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PopupWindow;