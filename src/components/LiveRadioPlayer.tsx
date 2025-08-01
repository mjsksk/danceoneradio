import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Radio } from 'lucide-react';
import { AlbumArtService } from '@/utils/AlbumArtService';

interface LiveRadioPlayerProps {
  streamUrls: string[];
  streamTitle: string;
}

const LiveRadioPlayer = ({ streamUrls, streamTitle }: LiveRadioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const [isLoadingArt, setIsLoadingArt] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const tryNextUrl = () => {
    if (currentUrlIndex < streamUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      return true;
    }
    return false;
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setCurrentUrlIndex(0); // Reset to first URL
      attemptPlay();
    }
  };

  // Fetch album art when stream title changes
  useEffect(() => {
    const fetchAlbumArt = async () => {
      if (!streamTitle || streamTitle.includes('Dance One Radio - The Future')) return;
      
      setIsLoadingArt(true);
      try {
        // Extract song title from the formatted stream title
        const songMatch = streamTitle.match(/🎵\s*(.*?)\s*•/);
        const songTitle = songMatch ? songMatch[1] : streamTitle;
        
        const result = await AlbumArtService.getAlbumArt(songTitle);
        setAlbumArt(result.imageUrl);
      } catch (error) {
        console.error('Error fetching album art:', error);
      } finally {
        setIsLoadingArt(false);
      }
    };

    fetchAlbumArt();
  }, [streamTitle]);

  const attemptPlay = () => {
    if (!audioRef.current) return;
    
    const currentUrl = streamUrls[currentUrlIndex];
    audioRef.current.src = currentUrl;
    
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(`Failed to play stream ${currentUrl}:`, error);
        if (tryNextUrl()) {
          setTimeout(attemptPlay, 1000); // Try next URL after 1 second
        } else {
          setIsLoading(false);
          console.error('All stream URLs failed');
        }
      });
  };

  return (
    <div className="card-cyber p-8 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center pulse-cyber overflow-hidden">
            {albumArt ? (
              <img 
                src={albumArt} 
                alt="Album Art" 
                className="w-full h-full object-cover rounded-full"
                onError={() => setAlbumArt(null)}
              />
            ) : (
              <Radio className="w-10 h-10 text-primary-foreground" />
            )}
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
        onError={() => {
          console.error('Audio element error');
          if (tryNextUrl()) {
            setTimeout(attemptPlay, 1000);
          } else {
            setIsLoading(false);
            setIsPlaying(false);
          }
        }}
      />
    </div>
  );
};

export default LiveRadioPlayer;