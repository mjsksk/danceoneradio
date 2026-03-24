import { useState, useEffect, useMemo } from 'react';
import SocialShare from '@/components/SocialShare';
import LiveRadioPlayer from './LiveRadioPlayer';
import { PRIMARY_STREAM_URLS } from '@/config/streamUrls';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { WavyBackground } from '@/components/ui/wavy-background';
import { Radio, Music2, Disc3 } from 'lucide-react';

const NowPlayingBlock = ({ streamTitle }: { streamTitle: string }) => {
  const [title, artist] = RadioStreamService.parseTrackInfo(streamTitle);
  
  return (
    <div className="mb-6 animate-fade-in max-w-md mx-auto">
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-background/10 backdrop-blur-md px-5 py-3">
        {/* Subtle animated gradient border glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 animate-pulse pointer-events-none" />
        
        <div className="relative flex items-center gap-3 min-w-0">
          {/* Spinning disc icon */}
          <div className="flex-shrink-0">
            <Disc3 className="w-8 h-8 text-primary animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          
          <div className="min-w-0 flex-1 text-left">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-primary/70 font-['Rajdhani'] font-semibold">
                Now Playing
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate font-['Rajdhani']">
              {title}
            </p>
            <p className="text-xs text-muted-foreground truncate font-['Rajdhani']">
              {artist}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSection = () => {
  const [streamTitle, setStreamTitle] = useState('🎵 Dance One Radio - The Future of Electronic Music • Live DJ Sets • Progressive House • Trance • Techno • Deep House 🎵');
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const fetchStreamMetadata = async () => {
      if (!isVisible) return;
      try {
        const metadata = await RadioStreamService.getStreamMetadata();
        const formattedTitle = RadioStreamService.formatTitle(metadata);
        setStreamTitle(formattedTitle);
      } catch (error) {
        console.error('Error fetching stream metadata:', error);
      }
    };

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        fetchStreamMetadata().then(scheduleNext);
      }, 10000);
    };

    if (isVisible) {
      fetchStreamMetadata().then(scheduleNext);
    } else {
      scheduleNext();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <WavyBackground
      colors={["#7c3aed", "#6d28d9", "#8b5cf6", "#a78bfa", "#22d3ee"]}
      waveOpacity={0.3}
      blur={12}
      speed="slow"
      backgroundFill="hsl(222.2, 84%, 4.9%)"
      containerClassName="min-h-screen"
    >
      <div className="text-center max-w-4xl mx-auto px-4">
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-center mb-6 hero-logo">
            <img 
              src="/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png" 
              alt="Dance One Radio" 
              className="h-96 md:h-[40rem] w-auto object-contain animate-neon-flicker"
              loading="eager"
              fetchPriority="high"
              width="640"
              height="640"
              decoding="sync"
            />
          </div>
        </div>

        {/* Now Playing Info */}
        <NowPlayingBlock streamTitle={streamTitle} />

        {/* Live Player */}
        <div className="mb-8 animate-slide-up">
          <LiveRadioPlayer streamUrls={[...PRIMARY_STREAM_URLS]} streamTitle={streamTitle} />
          
          {/* Social Share */}
          <div className="mt-6 flex justify-center">
            <SocialShare 
              url={window.location.href}
              title="Dance One Radio - The Future of Electronic Music"
              description="Live DJ sets featuring Progressive House, Trance, Techno, and Deep House music 24/7"
              image={`${window.location.origin}/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png`}
              className="bg-background/10 backdrop-blur-sm border-primary/30 hover:border-primary hover:bg-primary/10"
            />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mb-8 flex justify-center animate-float">
          <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-glow-pulse"></div>
          </div>
        </div>
      </div>
    </WavyBackground>
  );
};
export default HeroSection;
