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

    // Update every 30 seconds
    const interval = setInterval(fetchStreamMetadata, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]"></div>
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png" 
              alt="Dance One Radio" 
              className="h-32 md:h-48 w-auto object-contain animate-neon-flicker"
            />
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground font-['Rajdhani'] font-light max-w-2xl mx-auto leading-relaxed">
            The future of electronic music broadcasting. Live DJ sets, exclusive tracks, and the heartbeat of dance culture.
          </p>
        </div>

        {/* Live Player */}
        <div className="mb-8 animate-slide-up">
          <LiveRadioPlayer 
            streamUrls={[
              "http://s9.myradiostream.com:14296/;",
              "http://s9.myradiostream.com:14296/stream",
              "http://s9.myradiostream.com:14296",
              "https://live-radio-stream.online/dance-one-radio.mp3"
            ]}
            streamTitle={streamTitle}
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
          <Button className="btn-cyber" size="lg">
            <Volume2 className="w-5 h-5 mr-2" />
            Browse Shows
          </Button>
          <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground" size="lg">
            Download App
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-glow-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;