import { Radio } from 'lucide-react';
import stationLogo from '@/assets/dance-one-logo.png';

const PopupPlayerPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg p-6 w-full max-w-md space-y-6 text-center">
        {/* Header */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Radio className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Dance One Radio</span>
          </div>
          <p className="text-sm text-muted-foreground">Live Stream Player</p>
        </div>

        {/* Logo */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted mx-auto mb-4">
          <img
            src={stationLogo}
            alt="Dance One Radio"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Embedded Radio Player */}
        <div className="w-full">
          <iframe
            src="https://player-widget.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&light=1&feed=%2FDanceOneRadio%2F"
            frameBorder="0"
            className="w-full h-32 rounded-lg"
            allow="autoplay"
            title="Dance One Radio Player"
          />
        </div>

        {/* Alternative HTML5 Audio Fallback */}
        <div className="w-full">
          <audio 
            controls 
            className="w-full"
            preload="none"
          >
            <source src="https://streams.radio.co/s2c3cc784b/listen" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>

        <div className="text-xs text-muted-foreground">
          Use the player above to listen to Dance One Radio live
        </div>
      </div>
    </div>
  );
};

export default PopupPlayerPage;