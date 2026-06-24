/**
 * Wh0 Plays Sessions Episode 235 - Bad Intentions
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
import Wh0SessionNav from '@/components/Wh0SessionNav';
import { useState, useEffect } from 'react';

interface Track {
  position: number;
  title: string;
  artist: string;
  timestamp: string;
  label: string;
}

const Wh0PlaysSession235 = () => {
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = '/images/wh0-plays-sessions-logo.jpg';
  }, []);

  const tracks: Track[] = [
    { position: 1, timestamp: "00:33", artist: "Wh0 & Rue Jay", title: "Plastic Dreams", label: "Wh0 Plays" },
    { position: 2, timestamp: "04:28", artist: "Cassimm, Allan Nunez", title: "Puxa", label: "Golden Recordings" },
    { position: 3, timestamp: "07:44", artist: "Kyle Walker, Ruze", title: "6AM", label: "Dub Or Die" },
    { position: 4, timestamp: "11:48", artist: "Wh0 & Chandler McFadden", title: "Wet", label: "Wh0 Plays" },
    { position: 5, timestamp: "15:20", artist: "Seamus Haji, ATFC, K.C Flightt, Federico Scavo", title: "Speaker (Federico Scavo Extended Remix)", label: "Big Love" },
    { position: 6, timestamp: "20:05", artist: "Reza & JustGio", title: "Back In The Day", label: "Wh0 Plays" },
    { position: 7, timestamp: "24:20", artist: "Jude & Frank", title: "Uptown Jam", label: "Edible" },
    { position: 8, timestamp: "27:51", artist: "Soulsearcher, Ruze, Chesster", title: "Feelin' Love (Ruze & Chesster Extended Remix)", label: "Soulfuric Deep" },
    { position: 9, timestamp: "31:50", artist: "Piem", title: "Amor De Verano", label: "Petit Comite Of House" },
    { position: 10, timestamp: "35:50", artist: "Sam Frandisco", title: "Gotta Have It", label: "Wh0 Plays" },
    { position: 11, timestamp: "38:55", artist: "Milton Shadow", title: "Black Night", label: "HouseU" },
    { position: 12, timestamp: "42:40", artist: "Qubiko", title: "Beep Beep", label: "Umani Wax" },
    { position: 13, timestamp: "43:54", artist: "Bad Intentions & Trimtone", title: "Lovely Day", label: "Phoenix Music" },
    { position: 14, timestamp: "45:11", artist: "Kideko", title: "Burning Love", label: "Future Disco" },
    { position: 15, timestamp: "49:26", artist: "Folkness & Groove Seduction", title: "Tanzania", label: "Wh0 Worx" },
    { position: 16, timestamp: "53:24", artist: "Shahay & SOG", title: "Memphis", label: "Wh0 Worx" },
    { position: 17, timestamp: "56:28", artist: "Noir, Haze", title: "Around (Solomun Mix) (Kyle Watson Edit)", label: "Free Download" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <SEO
        title="Wh0 Sessions Episode 235 - Bad Intentions | Dance One Radio"
        description="Wh0 Plays Sessions Episode 235 - Bad Intentions. 17 house tracks featuring Wh0, Cassimm, Kyle Walker, Seamus Haji, Reza & JustGio, Qubiko and more."
        image="/lovable-uploads/mario-show.jpg"
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />
      <div
        className={`fixed inset-0 z-0 opacity-20 transition-opacity duration-500 ${
          bgLoaded ? 'opacity-20' : 'opacity-0'
        }`}
        style={{
          backgroundImage: 'url(/images/wh0-plays-sessions-logo.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
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
              <Wh0SessionNav current={235} className="mt-4" />
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-8">
                <img
                  src="/images/wh0-plays-sessions-logo.jpg"
                  alt="Wh0 Sessions Episode 235 - Bad Intentions"
                  className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
                  loading="eager"
                  width="320"
                  height="320"
                 decoding="async" srcSet="/images/wh0-plays-sessions-logo-480w.jpg 480w, /images/wh0-plays-sessions-logo-960w.jpg 960w, /images/wh0-plays-sessions-logo-1440w.jpg 1440w, /images/wh0-plays-sessions-logo.jpg 1920w" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"/>
              </div>
              <h1 className="text-3xl md:text-5xl font-['Orbitron'] font-bold mb-6 text-center">
                <span className="text-neon">Wh0 Sessions</span>{" "}
                <span className="text-neon-purple">235</span>
              </h1>
              <p className="text-center text-lg text-muted-foreground font-['Rajdhani'] mb-8">
                Bad Intentions
              </p>

              <Card className="card-cyber p-3 sm:p-6 mb-8">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-muted-foreground text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-neon" />
                    <span>2026</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-neon-purple" />
                    <span>60 min</span>
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
                    Wh0 Sessions Episode 235 - Bad Intentions. 17 tracks of house heat featuring
                    Wh0, Cassimm, Kyle Walker, Seamus Haji, Reza & JustGio, Qubiko, Bad Intentions and more.
                  </p>

                  <div className="mt-4">
                    <SocialShare
                      url={typeof window !== 'undefined' ? window.location.href : ''}
                      title="Wh0 Sessions Episode 235 - Bad Intentions - Dance One Radio"
                      description="Wh0 Sessions Episode 235 - Bad Intentions. 17 tracks of pure house energy."
                      image={`${typeof window !== 'undefined' ? window.location.origin : ''}/lovable-uploads/mario-show.jpg`}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <GoogleAds key="wh0-235-ad" slot={AD_SLOTS.IN_CONTENT} />

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
        <GoogleAds key="wh0-235-tracklist-ad" slot={AD_SLOTS.AFTER_TRACKLIST} format="rectangle" />
        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <Wh0SessionNav current={235} />
          </div>
        </div>
      </main>

      <Footer />
      </div>
    </div>
  );
};

export default Wh0PlaysSession235;
