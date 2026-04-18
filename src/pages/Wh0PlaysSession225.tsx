/**
 * Wh0 Plays Sessions Episode 225
 * Air date: April 17, 2026 at 6PM
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
  label: string;
}

const Wh0PlaysSession225 = () => {
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
    { position: 1, timestamp: "00:00", artist: "Nicole Powell", title: "Stay", label: "" },
    { position: 2, timestamp: "05:45", artist: "Route 94", title: "Forget The Girl", label: "" },
    { position: 3, timestamp: "09:50", artist: "Joshwa", title: "Lost In Music", label: "" },
    { position: 4, timestamp: "15:20", artist: "Mark Knight, Wh0", title: "Clap Your Hands", label: "" },
    { position: 5, timestamp: "19:25", artist: "Rue Jay x DJ Rae", title: "Free My Soul", label: "" },
    { position: 6, timestamp: "24:00", artist: "Rue Jay & Kim Fai", title: "Let Me Tell You Somethin'", label: "" },
    { position: 7, timestamp: "28:00", artist: "Rue Jay & Tanya Tanya", title: "Our Love", label: "" },
    { position: 8, timestamp: "32:30", artist: "Lisa Maffia & Molly Mouse", title: "Fever", label: "" },
    { position: 9, timestamp: "37:17", artist: "Joe Rolet", title: "No Hesitating (Max Dean Remix)", label: "" },
    { position: 10, timestamp: "40:45", artist: "Wh0 & Rue Jay", title: "Plastic Dreams", label: "" },
    { position: 11, timestamp: "44:45", artist: "Crazibiza", title: "Cheesecake Boys", label: "" },
    { position: 12, timestamp: "49:45", artist: "Subliminal Cuts", title: "Le Voie Soleil (Rue Jay & Cash Only Edit)", label: "" },
    { position: 13, timestamp: "54:05", artist: "Weiss", title: "Feel My Needs (Rue Jay & Cash Only Edit)", label: "" },
    { position: 14, timestamp: "57:40", artist: "Underworld x The Streets", title: "Born Slippy x Weak Become Heroes (Matt Hibbert Edit)", label: "" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <SEO 
        title="Wh0 Plays Sessions Episode 225 | Dance One Radio"
        description="Wh0 Plays Sessions Episode 225. 14 tracks featuring Mark Knight, Wh0, Rue Jay, Joshwa, Route 94, Weiss, Underworld and more."
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
                  src="/images/wh0-plays-sessions-logo.jpg" 
                  alt="Wh0 Plays Sessions 225"
                  className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
                  loading="eager"
                  width="320"
                  height="320"
                />
              </div>
              <h1 className="text-3xl md:text-5xl font-['Orbitron'] font-bold mb-6 text-center">
                <span className="text-neon">Wh0 Plays Sessions</span>{" "}
                <span className="text-neon-purple">225</span>
              </h1>
              <p className="text-center text-lg text-muted-foreground font-['Rajdhani'] mb-8">
                Mixed by <span className="text-primary font-semibold">Wh0</span>
              </p>
              
              <Card className="card-cyber p-3 sm:p-6 mb-8">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-muted-foreground text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-neon" />
                    <span>April 17, 2026</span>
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
                    Wh0 Plays Sessions Episode 225 — 
                    14 tracks of pure house energy featuring Mark Knight, Wh0, Rue Jay, 
                    Joshwa, Route 94, Weiss, Underworld and more.
                  </p>
                  
                  <div className="mt-4">
                    <SocialShare 
                      url={window.location.href}
                      title="Wh0 Plays Sessions Episode 225 - Dance One Radio"
                      description="Wh0 Plays Sessions Episode 225. 14 tracks of pure house energy."
                      image={`${window.location.origin}/lovable-uploads/mario-show.jpg`}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <GoogleAds key="wh0-225-ad" slot={AD_SLOTS.IN_CONTENT} />

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
                        {track.label && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-0.5">
                            {track.label}
                          </p>
                        )}
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
        <GoogleAds key="wh0-225-tracklist-ad" slot={AD_SLOTS.AFTER_TRACKLIST} format="rectangle" />
      </main>

      <Footer />
      </div>
    </div>
  );
};

export default Wh0PlaysSession225;
