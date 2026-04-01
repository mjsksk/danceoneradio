/**
 * Wh0 Plays Sessions Episode 222 with Johan S
 * Air date: March 27, 2026 at 6PM
 */

import { ArrowLeft, Calendar, Clock, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SocialShare from '@/components/SocialShare';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
import TrackAffiliateLinks from '@/components/TrackAffiliateLinks';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface Track {
  position: number;
  title: string;
  artist: string;
  timestamp: string;
}

const Wh0PlaysSession222 = () => {
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = '/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png';
  }, []);

  const tracks: Track[] = [
    { position: 1, timestamp: "00:24", artist: "Johan S", title: "Go Back (Extended Mix)" },
    { position: 2, timestamp: "04:04", artist: "Siege", title: "I Want You (Extended Mix)" },
    { position: 3, timestamp: "09:02", artist: "John Newman", title: "Love Me Again 'Again' (Wh0 Extended Remix)" },
    { position: 4, timestamp: "13:00", artist: "Piero Pirupa & Champagne Kenny", title: "Bring The Bassline (Extended Mix)" },
    { position: 5, timestamp: "15:25", artist: "Paul Johnson", title: "Get Get Down - James Hype Edit" },
    { position: 6, timestamp: "19:08", artist: "Deep Fiktion", title: "Loud & Clear (Extended Mix)" },
    { position: 7, timestamp: "22:21", artist: "Si Slay", title: "Shine Eyed Girl (Extended Mix)" },
    { position: 8, timestamp: "26:26", artist: "Yuuki Yoshiyama", title: "Identity (Extended Mix)" },
    { position: 9, timestamp: "30:03", artist: "DNKA", title: "Funky Whiteboy (Extended)" },
    { position: 10, timestamp: "32:17", artist: "Tita Lau", title: "Freaky (Extended Mix)" },
    { position: 11, timestamp: "35:45", artist: "Rue Jay x DJ Rae", title: "Free My Soul (Extended Mix)" },
    { position: 12, timestamp: "39:58", artist: "Johan S x Stephan Duy", title: "Like A Fire (Extended Mix)" },
    { position: 13, timestamp: "44:26", artist: "Wh0 & Low Steppa", title: "Raise Them (Extended Mix)" },
    { position: 14, timestamp: "47:09", artist: "Thomas Newson", title: "Come To Me (Extended Mix)" },
    { position: 15, timestamp: "49:39", artist: "Mark Knight, Wh0", title: "Clap Your Hands (Extended Mix)" },
    { position: 16, timestamp: "53:51", artist: "Tenacious", title: "What Can I Do (Extended Mix)" },
    { position: 17, timestamp: "57:20", artist: "Joseph Romano, Luca Bertoni", title: "Dare Me (Extended Mix)" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <SEO 
        title="Wh0 Plays Sessions Episode 222 with Johan S | Dance One Radio"
        description="Wh0 Plays Sessions Episode 222 featuring guest mix by Johan S. 17 tracks including John Newman, Piero Pirupa, Mark Knight, Low Steppa, Thomas Newson, and more."
        image="/lovable-uploads/mario-show.jpg"
        url={window.location.href}
      />
      <div 
        className={`fixed inset-0 z-0 opacity-20 transition-opacity duration-500 ${
          bgLoaded ? 'opacity-20' : 'opacity-0'
        }`}
        style={{
          backgroundImage: 'url(/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      />
      
      <div className="relative z-10">
        <Navigation />
      
      <main className="pt-16">
        <section className="py-6 sm:py-12 relative">
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
                  src="/images/wh0-plays-johan-s.jpg" 
                  alt="Wh0 Plays Sessions 222 - Johan S"
                  className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
                  loading="eager"
                  width="320"
                  height="320"
                />
              </div>
              <h1 className="text-3xl md:text-5xl font-['Orbitron'] font-bold mb-6 text-center">
                <span className="text-neon">Wh0 Plays Sessions</span>{" "}
                <span className="text-neon-purple">222</span>
              </h1>
              <p className="text-center text-xl text-muted-foreground font-['Rajdhani'] mb-8">
                Guest Mix by <span className="text-primary font-semibold">Johan S</span>
              </p>
              
              <Card className="card-cyber p-3 sm:p-6 mb-8">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-muted-foreground text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-neon" />
                    <span>March 27, 2026</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-neon-purple" />
                    <span>6:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-primary" />
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      House • Tech House • Dance
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Wh0 Plays Sessions Episode 222 featuring an exclusive guest mix by Johan S. 
                    17 tracks of pure house energy including John Newman, Piero Pirupa, Mark Knight, 
                    Wh0 & Low Steppa, Thomas Newson, and more.
                  </p>
                  
                  <div className="mt-4">
                    <SocialShare 
                      url={window.location.href}
                      title="Wh0 Plays Sessions Episode 222 with Johan S - Dance One Radio"
                      description="Wh0 Plays Sessions Episode 222 featuring guest mix by Johan S. 17 tracks of pure house energy."
                      image={`${window.location.origin}/lovable-uploads/mario-show.jpg`}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <GoogleAds key="wh0-222-ad" slot={AD_SLOTS.IN_CONTENT} />

        <section className="py-6 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Orbitron'] font-bold mb-4 sm:mb-8 text-center">
                <span className="text-neon-purple">Track Listing</span>
              </h2>
              
              <div className="grid gap-3">
                {tracks.map((track) => (
                  <Card key={track.position} className="card-cyber p-2 sm:p-4 hover:scale-[1.01] transition-all duration-200 group">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-neon/20 to-neon-purple/20 border border-neon/30 rounded-full flex items-center justify-center text-neon font-['Orbitron'] font-bold text-xs sm:text-sm shrink-0">
                        {track.position}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-semibold text-primary group-hover:text-neon transition-colors break-words sm:truncate">
                          {track.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground break-words sm:truncate">
                          {track.artist}
                        </p>
                        <p className="text-[10px] sm:text-xs text-neon/60 font-mono mt-0.5">
                          {track.timestamp}
                        </p>
                        <div className="sm:hidden">
                          <TrackAffiliateLinks title={track.title} artist={track.artist} variant="mobile" />
                        </div>
                      </div>
                      
                      <div className="hidden sm:block">
                        <TrackAffiliateLinks title={track.title} artist={track.artist} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
        <GoogleAds key="wh0-222-tracklist-ad" slot={AD_SLOTS.AFTER_TRACKLIST} format="rectangle" />
      </main>

      <Footer />
      </div>
    </div>
  );
};

export default Wh0PlaysSession222;
