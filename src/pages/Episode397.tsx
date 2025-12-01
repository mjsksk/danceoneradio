import { useEffect, useRef, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Share2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';
import { LoginPrompt } from '@/components/LoginPrompt';
import { useAuth } from '@/contexts/AuthContext';
import { useListeningProgress } from '@/hooks/useListeningProgress';
import applePodcastIcon from '@/assets/app-store-badge-new.svg';

interface Track {
  position: number;
  title: string;
  artist: string;
  unreleased?: boolean;
}

const Episode397 = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bgLoaded, setBgLoaded] = useState(false);

  const episodeNumber = 397;
  const episodeTitle = "Anthems of the week 397";
  const audioUrl = "https://media.blubrry.com/biggest_tunes_with_mario_135/mc.blubrry.com/biggest_tunes_with_mario_135/Biggest-Tunes-with-Mario-397-streamed.mp3?awCollectionId=673838&awEpisodeId=11864214&aw_0_azn.pgenre=Music&aw_0_1st.ri=blubrry&aw_0_azn.pcountry=US&aw_0_azn.planguage=en-us&cat_exclude=IAB1-8%2CIAB1-9%2CIAB7-41%2CIAB8-5%2CIAB8-18%2CIAB11-4%2CIAB23%2CIAB24%2CIAB25%2CIAB26&aw_0_cnt.rss=https%3A%2F%2Ffeeds.blubrry.com%2Ffeeds%2Fbiggest_tunes_with_mario_135.xml";

  const { 
    progress, 
    loading: progressLoading, 
    saveProgress, 
    markCompleted 
  } = useListeningProgress(episodeNumber, episodeTitle, audioUrl);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = '/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png';
    img.onload = () => setBgLoaded(true);
  }, []);

  useEffect(() => {
    if (progress && audioRef.current && !progressLoading) {
      audioRef.current.currentTime = progress.playback_position;
      setCurrentTime(progress.playback_position);
    }
  }, [progress, progressLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && isPlaying && user) {
        saveProgress(audioRef.current.currentTime, audioRef.current.duration);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, user, saveProgress]);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      setIsLoading(true);
      if (isPlaying) {
        audioRef.current.pause();
        if (user) {
          await saveProgress(audioRef.current.currentTime, audioRef.current.duration);
        }
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
      toast({
        title: "Playback Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      
      if (audioRef.current.currentTime >= audioRef.current.duration - 5 && user) {
        markCompleted();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const tracks: Track[] = [
    // Tracks will be added via CSV import
  ];

  const handleShare = async () => {
    const shareData = {
      title: episodeTitle,
      text: 'Check out this episode of Future Dance Anthems with Mario!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "Thanks for spreading the word!",
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Share link has been copied to clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={episodeTitle}
        description="Listen to the latest electronic dance music anthems in this episode of Future Dance Anthems with Mario."
        image="/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png"
        url={`https://danceoneradio.live/episode/${episodeNumber}`}
      />
      
      <div 
        className="fixed inset-0 z-0 transition-opacity duration-1000"
        style={{
          backgroundImage: bgLoaded ? 'url(/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png)' : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: bgLoaded ? 0.15 : 0,
        }}
      />

      <div className="relative z-10">
        <Navigation />

        <main className="container mx-auto px-4 py-8 mt-20">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-['Orbitron'] font-bold">
                <span className="text-neon">Episode {episodeNumber}</span>
              </h1>
              <p className="text-xl text-muted-foreground font-['Rajdhani']">
                Future Dance Anthems with Mario
              </p>
            </div>

            {!user && (
              <div className="animate-fade-in">
                <LoginPrompt />
              </div>
            )}

            {user && progress && progress.playback_position > 30 && !progress.completed && (
              <Card className="p-4 bg-primary/10 border-primary/20 animate-fade-in">
                <p className="text-sm text-foreground text-center">
                  Resume from {formatTime(progress.playback_position)}
                </p>
              </Card>
            )}

            <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => {
                  setIsPlaying(false);
                  if (user) markCompleted();
                }}
              />

              <div className="space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={handlePlayPause}
                    disabled={isLoading}
                    className="w-16 h-16 rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleShare}
                    className="w-16 h-16 rounded-full"
                  >
                    <Share2 className="w-6 h-6" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {tracks.length > 0 && (
              <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
                <h2 className="text-2xl font-['Orbitron'] font-bold mb-6 text-neon">Track Listing</h2>
                <div className="space-y-3">
                  {tracks.map((track) => (
                    <div
                      key={track.position}
                      className="flex items-start gap-4 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                    >
                      <span className="text-primary font-semibold min-w-[2rem]">
                        {track.position}.
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{track.artist}</p>
                        <p className="text-sm text-muted-foreground">{track.title}</p>
                        {track.unreleased && (
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                            Unreleased
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
              <h3 className="text-xl font-['Orbitron'] font-bold mb-4 text-neon">Listen on Other Platforms</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  asChild
                >
                  <a
                    href="https://podcasts.apple.com/us/podcast/future-dance-anthems-with-mario/id1439656478"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <img src={applePodcastIcon} alt="Apple Podcasts" className="w-5 h-5" />
                    Listen on Apple Podcasts
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Episode397;
