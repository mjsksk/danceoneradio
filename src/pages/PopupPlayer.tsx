import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radio, Play, Pause, AlertCircle, CheckCircle } from 'lucide-react';
import stationLogo from '@/assets/dance-one-logo.png';

const PopupPlayerPage = () => {
  const [currentPlayer, setCurrentPlayer] = useState<'radio-co' | 'html5' | 'tunein' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const streamUrl = 'https://streams.radio.co/s2c3cc784b/listen';

  const resetState = () => {
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
  };

  const tryRadioCoPlayer = () => {
    resetState();
    setCurrentPlayer('radio-co');
    setUserInteracted(true);
  };

  const tryHTML5Player = async () => {
    if (!audioRef.current) return false;
    
    resetState();
    setIsLoading(true);
    setCurrentPlayer('html5');
    setUserInteracted(true);

    try {
      audioRef.current.src = streamUrl;
      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('HTML5 player failed:', error);
      setIsLoading(false);
      setError('HTML5 player failed to start');
      return false;
    }
  };

  const tryTuneInPlayer = () => {
    resetState();
    setCurrentPlayer('tunein');
    setUserInteracted(true);
  };

  const handlePlayPause = async () => {
    if (!userInteracted) {
      // Try Radio.co embedded player first
      tryRadioCoPlayer();
      return;
    }

    if (currentPlayer === 'html5' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Playback failed:', error);
          setError('Playback failed');
        }
      }
    } else {
      // For other players, try HTML5 as fallback
      await tryHTML5Player();
    }
  };

  const tryNextPlayer = async () => {
    if (currentPlayer === 'radio-co') {
      const success = await tryHTML5Player();
      if (!success) {
        tryTuneInPlayer();
      }
    } else if (currentPlayer === 'html5') {
      tryTuneInPlayer();
    } else {
      tryRadioCoPlayer();
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleError = () => {
        setIsPlaying(false);
        setError('Stream connection failed');
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('error', handleError);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg p-6 w-full max-w-md space-y-6 text-center">
        {/* Header */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Radio className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Dance One Radio</span>
            <Badge variant={isPlaying ? "default" : "secondary"} className="ml-2">
              {isPlaying ? "LIVE" : "READY"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Multi-Player Stream</p>
        </div>

        {/* Logo */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted mx-auto">
          <img
            src={stationLogo}
            alt="Dance One Radio"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Player Status */}
        <div className="space-y-2">
          <div className="text-sm font-medium">
            {currentPlayer === 'radio-co' && 'Radio.co Player Active'}
            {currentPlayer === 'html5' && 'HTML5 Player Active'}
            {currentPlayer === 'tunein' && 'TuneIn Player Active'}
            {!currentPlayer && 'Click Play to Start'}
          </div>
          
          {error && (
            <div className="flex items-center justify-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          {isPlaying && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Streaming Live
            </div>
          )}
        </div>

        {/* Primary Player - Radio.co Embedded */}
        {currentPlayer === 'radio-co' && (
          <div className="w-full border rounded-lg overflow-hidden">
            <iframe
              src="https://player-widget.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&light=1&feed=%2FDanceOneRadio%2F"
              frameBorder="0"
              className="w-full h-32"
              allow="autoplay"
              title="Dance One Radio Player"
            />
          </div>
        )}

        {/* Secondary Player - HTML5 Audio */}
        {currentPlayer === 'html5' && (
          <div className="w-full">
            <audio 
              ref={audioRef}
              controls 
              className="w-full"
              preload="none"
            >
              <source src={streamUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Tertiary Player - TuneIn Embed */}
        {currentPlayer === 'tunein' && (
          <div className="w-full border rounded-lg overflow-hidden">
            <iframe
              src="https://tunein.com/embed/player/s25434/"
              frameBorder="0"
              className="w-full h-32"
              allow="autoplay"
              title="TuneIn Player"
            />
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={handlePlayPause}
            disabled={isLoading}
            size="lg"
            className="rounded-full w-16 h-16"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
            ) : isPlaying && currentPlayer === 'html5' ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>

          {error && currentPlayer && (
            <Button
              onClick={tryNextPlayer}
              variant="outline"
              size="lg"
            >
              Try Next Player
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Click Play to start with Radio.co player</div>
          <div>Automatic fallback to HTML5 and TuneIn if needed</div>
        </div>
      </div>
    </div>
  );
};

export default PopupPlayerPage;