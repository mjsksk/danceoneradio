import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';

import heroImage from '@/assets/hero-bg.jpg';
import LiveRadioPlayer from './LiveRadioPlayer';
import { RadioStreamService } from '@/utils/RadioStreamService';
const HeroSection = () => {
  const [streamTitle, setStreamTitle] = useState('🎵 Dance One Radio - The Future of Electronic Music • Live DJ Sets • Progressive House • Trance • Techno • Deep House 🎵');
  useEffect(() => {
    const fetchStreamMetadata = async () => {
      try {
        const metadata = await RadioStreamService.getStreamMetadata();
        const formattedTitle = RadioStreamService.formatTitle(metadata);
        setStreamTitle(formattedTitle);
      } catch (error) {
        console.error('Error fetching stream metadata:', error);
      }
    };

    // Fetch immediately
    fetchStreamMetadata();

    // Update every 1 second for real-time updates
    const interval = setInterval(fetchStreamMetadata, 1000);
    return () => clearInterval(interval);
  }, []);
  return <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video with Overlay */}
      <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline poster={heroImage}>
        <source src="https://upbwlnpycrbhxahjztrf.supabase.co/storage/v1/object/public/videos/Laser-Beam.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]"></div>

      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => <div key={i} className="absolute w-2 h-2 bg-primary/30 rounded-full animate-float" style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${4 + Math.random() * 4}s`
      }} />)}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <picture>
              <source 
                srcSet="/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png?w=640&f=webp 640w,
                        /lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png?w=800&f=webp 800w,
                        /lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png?w=1024&f=webp 1024w"
                sizes="(max-width: 768px) 384px, 640px"
                type="image/webp"
              />
              <img 
                src="/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png" 
                srcSet="/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png?w=640 640w,
                        /lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png?w=800 800w,
                        /lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png?w=1024 1024w"
                sizes="(max-width: 768px) 384px, 640px"
                alt="Dance One Radio" 
                className="h-96 md:h-[40rem] w-auto object-contain animate-neon-flicker"
                loading="eager"
              />
            </picture>
          </div>
        </div>

        {/* Live Player */}
        <div className="mb-8 animate-slide-up">
          <LiveRadioPlayer streamUrls={["http://s9.myradiostream.com:14296/;", "http://s9.myradiostream.com:14296/stream", "http://s9.myradiostream.com:14296", "https://live-radio-stream.online/dance-one-radio.mp3"]} streamTitle={streamTitle} />
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