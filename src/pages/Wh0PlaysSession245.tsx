/**
 * Wh0 Plays Sessions Episode 245
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

const Wh0PlaysSession245 = () => {
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
    { position: 1, timestamp: "00:55", artist: "Low Steppa, Jewel Kid", title: "The Roller (Wh0 Remix)", label: "Wh0 Plays" },
    { position: 2, timestamp: "04:40", artist: "Sam Frandisco, Yomanda", title: "Werk It", label: "Wh0 Plays" },
    { position: 3, timestamp: "07:45", artist: "Sophia Guerrero", title: "The Funk", label: "Wh0 Plays" },
    { position: 4, timestamp: "10:43", artist: "Harry Fitsch, Niwey", title: "Lift Me Up", label: "Wh0 Plays" },
    { position: 5, timestamp: "13:15", artist: "Inner City", title: "Pennies From Heaven (Wh0 Mashup)", label: "Wh0 Plays" },
    { position: 6, timestamp: "16:43", artist: "David Novacek & Jon Costa", title: "Joy", label: "Wh0 Plays" },
    { position: 7, timestamp: "20:13", artist: "Matthew Sax, Bad Intentions", title: "House On Fire", label: "Wh0 Plays" },
    { position: 8, timestamp: "23:30", artist: "Mark Knight, Cristoph", title: "Yebisah", label: "Wh0 Plays" },
    { position: 9, timestamp: "27:05", artist: "Supernova", title: "The Joy (Daniel Steinberg Extended Remix)", label: "Wh0 Plays" },
    { position: 10, timestamp: "28:48", artist: "Piem", title: "Give Me The Rhythm", label: "Wh0 Plays" },
    { position: 11, timestamp: "31:44", artist: "Luccio B", title: "Lost in Funk (Luccio B 2026 Remix)", label: "Wh0 Plays" },
    { position: 12, timestamp: "35:12", artist: "Reed Rothchild", title: "You Get Down", label: "Wh0 Plays" },
    { position: 13, timestamp: "37:55", artist: "Illyus Barrientos", title: "Be Hot.", label: "Wh0 Plays" },
    { position: 14, timestamp: "41:25", artist: "Nicole Fiallo", title: "Llego La Rumba", label: "Wh0 Plays" },
    { position: 15, timestamp: "44:49", artist: "Pinto (NYC)", title: "Thalias Disco", label: "Wh0 Plays" },
    { position: 16, timestamp: "48:07", artist: "Mochakk", title: "Da Fonk (feat. Joni)", label: "Wh0 Plays" },
    { position: 17, timestamp: "52:04", artist: "Angel Heredia", title: "Discolo", label: "Wh0 Plays" },
    { position: 18, timestamp: "54:05", artist: "Soul Central", title: "Strings Of Life (Un Amore Supremo)", label: "Wh0 Plays" },
    { position: 19, timestamp: "58:55", artist: "Wh0", title: "Rock The Party", label: "Wh0 Plays" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <SEO
        title="Wh0 Plays Sessions Episode 245 Tracklist | Dance One Radio"
        description="Wh0 Plays Sessions Episode 245 full tracklist. 19 house and tech house tracks featuring Low Steppa, Jewel Kid, Sam Frandisco, Yomanda, Sophia Guerrero, Harry Fitsch, Inner City, Mark Knight, Cristoph, Supernova, Piem, Illyus Barrientos, Mochakk, Wh0 and more."
        image="https://danceoneradio.com/lovable-uploads/mario-show.jpg"
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
              <Wh0SessionNav current={245} className="mt-4" />
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-8">
                <img
                  src="/images/wh0-plays-sessions-logo.jpg"
                  alt="Wh0 Plays Sessions Episode 245"
                  className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
                  loading="eager"
                  width="320"
                  height="320"
                  decoding="async"
                  srcSet="/images/wh0-plays-sessions-logo-480w.jpg 480w, /images/wh0-plays-sessions-logo-960w.jpg 960w, /images/wh0-plays-sessions-logo-1440w.jpg 1440w, /images/wh0-plays-sessions-logo.jpg 1920w"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <h1 className="text-3xl md:text-5xl font-['Orbitron'] font-bold mb-4 text-center">
                <span className="text-neon">Wh0 Plays Sessions</span>{" "}
                <span className="text-neon-purple">245</span>
              </h1>

              <Card className="card-cyber p-3 sm:p-6 mb-8">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-muted-foreground text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-neon" />
                    <span>September 4, 2026</span>
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
                    Wh0 Plays Sessions Episode 245. 19 tracks of pure house energy featuring Low Steppa,
                    Jewel Kid, Sam Frandisco, Yomanda, Sophia Guerrero, Harry Fitsch, Inner City, David Novacek,
                    Jon Costa, Mark Knight, Cristoph, Supernova, Piem, Illyus Barrientos, Mochakk, Wh0 and more.
                  </p>

                  <div className="mt-4">
                    <SocialShare
                      url={typeof window !== 'undefined' ? window.location.href : ''}
                      title="Wh0 Plays Sessions Episode 245 - Dance One Radio"
                      description="Wh0 Plays Sessions Episode 245 - 19 tracks of house heat."
                      image={`${typeof window !== 'undefined' ? window.location.origin : ''}/lovable-uploads/mario-show.jpg`}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <GoogleAds key="wh0-245-ad" slot={AD_SLOTS.IN_CONTENT} />

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
        <GoogleAds key="wh0-245-tracklist-ad" slot={AD_SLOTS.AFTER_TRACKLIST} format="rectangle" />
        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <Wh0SessionNav current={245} />
          </div>
        </div>
      </main>

      <Footer />
      </div>
    </div>
  );
};

export default Wh0PlaysSession245;
