import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import SocialShare from '@/components/SocialShare';

import heroImage from '@/assets/hero-bg.jpg';
import LiveRadioPlayer from './LiveRadioPlayer';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { ShaderAnimation } from '@/components/ui/shader-lines';
const HeroSection = () => {
  const [streamTitle, setStreamTitle] = useState('🎵 Dance One Radio - The Future of Electronic Music • Live DJ Sets • Progressive House • Trance • Techno • Deep House 🎵');
  
  // Array of background videos - randomly selected on each page visit
  const backgroundVideos = [
    "https://upbwlnpycrbhxahjztrf.supabase.co/storage/v1/object/public/videos/Laser-Beam.mp4",
    "https://upbwlnpycrbhxahjztrf.supabase.co/storage/v1/object/public/videos/sci_fi_background.mp4",
    "https://upbwlnpycrbhxahjztrf.supabase.co/storage/v1/object/public/videos/wave_flow.mp4",
    "/Sequence_01.mp4"
  ];
  
  // Check if we should show Halloween video (until November 1st, 2025)
  const now = new Date();
  const halloweenEndDate = new Date('2025-11-01T00:00:00');
  const isHalloweenPeriod = now < halloweenEndDate;
  
  // Select video: Halloween video until Nov 1st, then random selection
  const selectedVideo = isHalloweenPeriod 
    ? "/halloween-video.mp4"
    : backgroundVideos[Math.floor(Math.random() * backgroundVideos.length)];
  
  const [videoKey, setVideoKey] = useState(0);
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const fetchStreamMetadata = async () => {
      // Skip if tab is not visible
      if (!isVisible) {
        console.log('🎵 HeroSection: Skipping metadata fetch - tab not visible');
        return;
      }

      try {
        const metadata = await RadioStreamService.getStreamMetadata();
        const formattedTitle = RadioStreamService.formatTitle(metadata);
        setStreamTitle(formattedTitle);
      } catch (error) {
        console.error('Error fetching stream metadata:', error);
      }
    };

    const scheduleNext = () => {
      // Update every 10 seconds instead of 1 second - 90% reduction
      timeoutId = setTimeout(() => {
        fetchStreamMetadata().then(scheduleNext);
      }, 10000);
    };

    // Fetch immediately if visible
    if (isVisible) {
      fetchStreamMetadata().then(scheduleNext);
    } else {
      scheduleNext();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Force video refresh on component mount to ensure new video selection
  useEffect(() => {
    setVideoKey(prev => prev + 1);
  }, []);
  return <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Shader Animation Background */}
      <ShaderAnimation />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]"></div>

      {/* Animated Particles - Reduced to 8 with GPU acceleration */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => <div key={i} className="absolute w-2 h-2 bg-primary/30 rounded-full animate-float" style={{
        left: `${(i * 12.5) + Math.random() * 10}%`,
        top: `${(i * 12.5) + Math.random() * 10}%`,
        animationDelay: `${i * 0.75}s`,
        animationDuration: `${4 + (i % 3)}s`,
        willChange: 'transform',
        transform: 'translateZ(0)'
      }} />)}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
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

        {/* Live Player */}
        <div className="mb-8 animate-slide-up">
          <LiveRadioPlayer streamUrls={["http://s9.myradiostream.com:14296/;", "http://s9.myradiostream.com:14296/stream", "http://s9.myradiostream.com:14296", "https://live-radio-stream.online/dance-one-radio.mp3"]} streamTitle={streamTitle} />
          
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
    </section>;
};
export default HeroSection;