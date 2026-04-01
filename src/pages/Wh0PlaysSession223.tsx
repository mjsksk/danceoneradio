/**
 * Wh0 Plays Sessions Episode 223 - Bad Intentions
 * Air date: April 3, 2026 at 6PM
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

const Wh0PlaysSession223 = () => {
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
    { position: 1, timestamp: "00:33", artist: "Mark Knight & Wh0", title: "Clap Your Hands", label: "Toolroom" },
    { position: 2, timestamp: "04:10", artist: "Rue Jay x DJ Rae", title: "Free My Soul", label: "Wh0 Plays" },
    { position: 3, timestamp: "07:41", artist: "TRIPL", title: "Deep Down", label: "HouseU" },
    { position: 4, timestamp: "11:37", artist: "LP Giobbi, Emjie", title: "Spirit Higher", label: "Yes Yes Yes" },
    { position: 5, timestamp: "15:00", artist: "Alexander Som", title: "Sauvage", label: "Golden Recordings" },
    { position: 6, timestamp: "18:03", artist: "Glaxxs", title: "Like This", label: "Wh0 Worx" },
    { position: 7, timestamp: "20:50", artist: "Crusy", title: "A Sunset In San Francisco", label: "Toolroom" },
    { position: 8, timestamp: "24:55", artist: "Earth N Days", title: "Gonna Do", label: "HouseU" },
    { position: 9, timestamp: "28:10", artist: "Angelo Ferreri, Pietro Over Jack", title: "The Subliminal Effect", label: "Rap Jack Music" },
    { position: 10, timestamp: "32:00", artist: "Trimtone", title: "Don't Go", label: "Ibiza Underground Movement" },
    { position: 11, timestamp: "36:50", artist: "Castion", title: "Boys Go Loco", label: "Wh0 Worx" },
    { position: 12, timestamp: "41:04", artist: "Afrojack, Lucas & Steve", title: "Control", label: "Black Book Records" },
    { position: 13, timestamp: "44:11", artist: "Wh0 & Low Steppa", title: "Raise Them", label: "Edible Records" },
    { position: 14, timestamp: "47:27", artist: "Shermanology", title: "Give You My Luv", label: "D'Eaupe" },
    { position: 15, timestamp: "50:04", artist: "Yuuki Yoshiyama", title: "Identity", label: "Wh0 Plays" },
    { position: 16, timestamp: "53:58", artist: "ATFC feat. Lisa Millet", title: "Bad Habit (Tommy Mambretti Re-Edit)", label: "Independent" },
    { position: 17, timestamp: "56:25", artist: "Kyle Walker, Nate Katz", title: "Two Hearts", label: "Factory 93 Records" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <SEO 
        title="Wh0 Plays Sessions Episode 223 - Bad Intentions | Dance One Radio"
        description="Wh0 Plays Sessions Episode 223 'Bad Intentions'. 17 tracks featuring Mark Knight, Afrojack, Lucas & Steve, LP Giobbi, Wh0 & Low Steppa, and more."
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
                  src="/images/wh0-plays-bad-intentions.jpg" 
                  alt="Wh0 Plays Sessions 223 - Bad Intentions"
                  className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
                  loading="eager"
                  width="320"
                  height="320"
                />
              </div>
              <h1 className="text-3xl md:text-5xl font-['Orbitron'] font-bold mb-6 text-center">
                <span className="text-neon">Wh0 Plays Sessions</span>{" "}
                <span className="text-neon-purple">223</span>
              </h1>
              <p className="text-center text-xl text-muted-foreground font-['Rajdhani'] mb-2">
                <span className="text-primary font-semibold">Bad Intentions</span>
              </p>
              <p className="text-center text-lg text-muted-foreground font-['Rajdhani'] mb-8">
                Mixed by <span className="text-primary font-semibold">Wh0</span>
              </p>
              
              <Card className="card-cyber p-3 sm:p-6 mb-8">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-muted-foreground text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-neon" />
                    <span>April 3, 2026</span>
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
                    Wh0 Plays Sessions Episode 223 "Bad Intentions" — 
                    17 tracks of pure house energy featuring Mark Knight & Wh0, Afrojack, Lucas & Steve, 
                    LP Giobbi, Wh0 & Low Steppa, Shermanology, and more.
                  </p>
                  
                  <div className="mt-4">
                    <SocialShare 
                      url={window.location.href}
                      title="Wh0 Plays Sessions Episode 223 Bad Intentions - Dance One Radio"
                      description="Wh0 Plays Sessions Episode 223 'Bad Intentions'. 17 tracks of pure house energy."
                      image={`${window.location.origin}/lovable-uploads/mario-show.jpg`}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <GoogleAds key="wh0-223-ad" slot={AD_SLOTS.IN_CONTENT} />

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
                        <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-0.5">
                          {track.label}
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
        <GoogleAds key="wh0-223-tracklist-ad" slot={AD_SLOTS.AFTER_TRACKLIST} format="rectangle" />
      </main>

      <Footer />
      </div>
    </div>
  );
};

export default Wh0PlaysSession223;
