import { useMemo } from 'react';
import SocialShare from '@/components/SocialShare';
import LiveRadioPlayer from './LiveRadioPlayer';
import { PRIMARY_STREAM_URLS } from '@/config/streamUrls';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { WavyBackground } from '@/components/ui/wavy-background';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Radio, Music2, Disc3 } from 'lucide-react';

const NowPlayingBlock = ({ streamTitle }: { streamTitle: string }) => {
  const [title, artist] = RadioStreamService.parseTrackInfo(streamTitle);
  
  return (
    <div className="mt-2 md:-mt-4 mb-4 animate-fade-in max-w-2xl mx-auto w-full">
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-background/20 backdrop-blur-md px-6 py-4 shadow-[0_0_30px_hsl(var(--primary)/0.18)]">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-pulse pointer-events-none" />

        <div className="relative flex flex-col items-center gap-2 min-w-0">
          <Disc3 className="h-10 w-10 text-primary animate-spin" style={{ animationDuration: '3s' }} />

          <div className="min-w-0 w-full text-center">
            <div className="mb-1 flex items-center justify-center gap-2">
              <span className="relative flex h-3 w-3 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-70 animate-ping"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive"></span>
              </span>
              <span className="font-['Orbitron'] text-xs font-bold uppercase tracking-[0.35em] text-primary/80">
                Now Playing Live
              </span>
            </div>
            <p className="truncate max-w-full font-['Orbitron'] text-base font-bold leading-tight text-foreground sm:text-lg md:text-2xl">
              {title}
            </p>
            <p className="truncate max-w-full font-['Orbitron'] text-xs text-muted-foreground sm:text-sm md:text-base">
              {artist}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSection = () => {
  const { streamTitle: contextStreamTitle } = useAudioPlayer();
  const streamTitle = contextStreamTitle || '🎵 Dance One Radio - The Future of Electronic Music • Live DJ Sets • Progressive House • Trance • Techno • Deep House 🎵';

  return (
    <WavyBackground
      colors={["#7c3aed", "#6d28d9", "#8b5cf6", "#a78bfa", "#22d3ee"]}
      waveOpacity={0.3}
      blur={12}
      speed="slow"
      backgroundFill="hsl(222.2, 84%, 4.9%)"
      containerClassName="min-h-screen"
    >
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-4 pt-32 md:pt-36">
        <div className="mb-4">
          <h1 className="sr-only">Dance One Radio — Live Electronic & Dance Music 24/7</h1>
          <div className="hero-logo flex justify-center">
            <picture>
              <source
                type="image/webp"
                srcSet="/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662-240w.webp 240w, /lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662-480w.webp 480w, /lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662-960w.webp 960w"
                sizes="(max-width: 767px) 224px, 368px"
              />
              <img 
                src="/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662-480w.png" 
                alt="Dance One Radio" 
                className="h-56 md:h-[23rem] w-auto object-contain"
                loading="eager"
                fetchPriority="high"
                width="640"
                height="640"
                decoding="sync"
               srcSet="/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662-480w.png 480w, /lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662-960w.png 960w" sizes="(max-width: 767px) 224px, 368px"/>
            </picture>

          </div>
        </div>

        <NowPlayingBlock streamTitle={streamTitle} />

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
