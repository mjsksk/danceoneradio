import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Radio } from 'lucide-react';

interface LiveRadioPlayerProps {
  streamUrl: string;
  streamTitle: string;
}

const LiveRadioPlayer = ({ streamUrl, streamTitle }: LiveRadioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to play stream:', error);
          setIsLoading(false);
        });
    }
  };

  return (
    <div className="card-cyber p-8 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center pulse-cyber">
            <Radio className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-glow-pulse">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <h3 className="text-lg font-['Orbitron'] font-semibold text-primary mb-2">NOW PLAYING</h3>
        <div className="relative overflow-hidden bg-background/20 rounded-md p-2 mb-2">
          <div className="animate-scroll whitespace-nowrap">
            <span className="text-sm text-foreground font-['Rajdhani'] font-medium">
              {streamTitle}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Broadcasting Live 24/7</p>
      </div>

      {/* Audio Visualizer */}
      <div className="flex items-center justify-center space-x-1 mb-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-primary rounded-full wave-animation"
            style={{
              height: `${20 + Math.random() * 40}px`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      <Button
        onClick={handlePlayPause}
        className="btn-cyber w-full"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
            LOADING...
          </>
        ) : isPlaying ? (
          <>
            <Pause className="w-5 h-5 mr-2" />
            PAUSE STREAM
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            LISTEN LIVE
          </>
        )}
      </Button>

      <audio
        ref={audioRef}
        preload="none"
        src={streamUrl}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
        }}
      />
    </div>
  );
};

export default LiveRadioPlayer;