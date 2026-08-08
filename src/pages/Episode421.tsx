import { ArrowLeft, Calendar, Clock, Play, Pause, Apple, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SocialShare from '@/components/SocialShare';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { LoginPrompt } from '@/components/LoginPrompt';
import EpisodeTracklist from '@/components/EpisodeTracklist';
import { EpisodeEqVisualizer } from '@/components/EpisodeEqVisualizer';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useListeningProgress } from '@/hooks/useListeningProgress';

const Episode421 = () => {
  const { user } = useAuth();
  const episodeNumber = 421;
  const episodeTitle = "Anthems of the week 421";
  // TODO: update once episode is published in the RSS feed
  const audioUrl = "";

  const { progress, saveProgress } = useListeningProgress(episodeNumber, episodeTitle, audioUrl);

  const audioPlayer = useAudioPlayer();
  const isCurrent = audioPlayer.source === 'episode' && audioPlayer.episodeInfo?.number === episodeNumber;
  const isPlaying = isCurrent && audioPlayer.isPlaying;
  const isLoading = isCurrent && audioPlayer.isLoading;
  const currentTime = isCurrent ? audioPlayer.currentTime : 0;
  const duration = isCurrent ? audioPlayer.duration : 0;

  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = '/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png';
  }, []);

  useEffect(() => {
    if (!user || !isCurrent || !isPlaying) return;
    const interval = setInterval(() => {
      if (currentTime > 0 && duration > 0) {
        saveProgress(currentTime, duration);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user, isCurrent, isPlaying, currentTime, duration, saveProgress]);

  const handlePlayPause = () => {
    if (!audioUrl) return;
    if (isCurrent) {
      if (audioPlayer.isPlaying) {
        audioPlayer.pause();
        if (user && currentTime > 0 && duration > 0) {
          saveProgress(currentTime, duration);
        }
      } else {
        audioPlayer.resume();
      }
    } else {
      audioPlayer.playEpisode({ number: episodeNumber, title: episodeTitle, audioUrl });
      if (progress && progress.playback_position > 0) {
        setTimeout(() => audioPlayer.seek(progress.playback_position), 500);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCurrent || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audioPlayer.seek(percentage * duration);
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <SEO
        title="Anthems of the Week 421 | Dance One Radio"
        description="Episode 421 tracklist featuring Swedish House Mafia, Solomun, Skrillex, KSHMR, Cloonee and more."
        image="/lovable-uploads/future-dance-anthems.jpg"
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />
      <div
        className={`fixed inset-0 z-0 opacity-20 transition-opacity duration-500 ${bgLoaded ? 'opacity-20' : 'opacity-0'}`}
        style={{
          backgroundImage: 'url(/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      />

      <div className="relative z-10">
        <Navigation />

        <main className="pt-16">
          <section className="py-12 relative">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <Link to="/shows">
                  <Button variant="ghost" className="mb-4 hover:text-primary">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Shows
                  </Button>
                </Link>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="flex justify-center mb-8">
                  <img
                    src="/lovable-uploads/future-dance-anthems.jpg"
                    alt="Future Dance Anthems with Mario - Episode 421"
                    className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
                    loading="eager"
                    width="320"
                    height="320"
                    decoding="async"
                    srcSet="/lovable-uploads/future-dance-anthems-480w.jpg 480w, /lovable-uploads/future-dance-anthems-960w.jpg 960w, /lovable-uploads/future-dance-anthems.jpg 1200w"
                    sizes="(max-width: 640px) 100vw, 320px"
                  />
                </div>
                <h1 className="text-3xl md:text-5xl font-['Orbitron'] font-bold mb-6 text-center">
                  <span className="text-neon">Anthems of the week</span>{' '}
                  <span className="text-neon-purple">421</span>
                </h1>

                <Card className="card-cyber p-6 mb-8">
                  <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-neon" />
                      <span>August 8, 2026</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-neon-purple" />
                      <span>{duration > 0 ? formatTime(duration) : 'Coming soon'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Music className="w-5 h-5 text-primary" />
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        EDM • House • Dance
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Anthems that shape today's dance scene...
                    </p>

                    <div className="w-full max-w-2xl mx-auto">
                      <div className="card-cyber p-6 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <Button
                            variant="ghost"
                            className="w-12 h-12 bg-gradient-to-br from-neon/20 to-neon-purple/20 border border-neon/30 rounded-full flex items-center justify-center hover:from-neon/30 hover:to-neon-purple/30 transition-all duration-200 p-0"
                            onClick={handlePlayPause}
                            disabled={isLoading || !audioUrl}
                          >
                            {isLoading ? (
                              <div className="w-4 h-4 border-2 border-neon border-t-transparent rounded-full animate-spin" />
                            ) : isPlaying ? (
                              <Pause className="w-6 h-6 text-neon" />
                            ) : (
                              <Play className="w-6 h-6 text-neon" />
                            )}
                          </Button>
                          <div className="flex-1 text-left">
                            <h3 className="font-semibold text-primary">Future Dance Anthems with Mario</h3>
                            <p className="text-sm text-muted-foreground">Episode 421 - Anthems of the week</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <EpisodeEqVisualizer isActive={isPlaying} />
                        </div>

                        <div className="space-y-2">
                          <div
                            className="h-2 bg-primary/40 border border-primary/50 rounded-full cursor-pointer group/progress hover:bg-primary/50 transition-colors"
                            onClick={handleSeek}
                          >
                            <div
                              className="h-full bg-neon-purple rounded-full transition-all duration-150 relative"
                              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                            >
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-neon-purple rounded-full shadow-lg shadow-neon-purple/50 opacity-0 group-hover/progress:opacity-100 transition-opacity border-2 border-background" />
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-primary font-medium">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>

                        {!user && (
                          <div className="mt-6">
                            <LoginPrompt />
                          </div>
                        )}

                        {user && progress && progress.playback_position > 30 && (
                          <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                            <p className="text-sm text-primary text-center">
                              ✨ Saved progress: Resume from {formatTime(progress.playback_position)}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 bg-background/50 rounded-lg p-4 border border-neon/20">
                          <div className="text-center mb-4">
                            <p className="text-muted-foreground mb-2">
                              This episode is available on our podcast platforms
                            </p>
                            <div className="flex justify-center gap-4 flex-wrap">
                              <Button
                                asChild
                                className="bg-gradient-to-r from-neon/20 to-neon-purple/20 border-neon/30 hover:from-neon/30 hover:to-neon-purple/30"
                              >
                                <a
                                  href="https://podcasts.apple.com/us/podcast/future-dance-anthems-with-mario/id1439656478"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2"
                                >
                                  <Apple className="w-4 h-4" />
                                  Listen on Apple Podcasts
                                </a>
                              </Button>
                              <Button variant="outline" asChild>
                                <Link to="/player" className="flex items-center gap-2">
                                  <Music className="w-4 h-4" />
                                  Live Radio
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <SocialShare
                        url={typeof window !== 'undefined' ? window.location.href : ''}
                        title="Anthems of the week 421 - Future Dance Anthems with Mario"
                        description="Anthems that shape today's dance scene..."
                        image={typeof window !== 'undefined' ? `${window.location.origin}/lovable-uploads/future-dance-anthems.jpg` : ''}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          <GoogleAds key="episode421-ad" slot="6777392184" />

          <EpisodeTracklist episodeNumber={episodeNumber} />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Episode421;