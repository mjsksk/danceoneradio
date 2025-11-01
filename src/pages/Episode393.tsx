import { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SocialShare from '@/components/SocialShare';
import SEO from '@/components/SEO';
import AdSenseUnit from '@/components/AdSenseUnit';

interface Track {
  position: number;
  title: string;
  artist: string;
  isUnreleased?: boolean;
}

const Episode393 = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Preload background image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = '/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png';
  }, []);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
    }
  };

  const tracks: Track[] = [
    { position: 1, title: "Illusory", artist: "Hana" },
    { position: 2, title: "Need Your Loving", artist: "Chaney" },
    { position: 3, title: "NO MATTER (Extended Mix)", artist: "BRUNO MARTINI" },
    { position: 4, title: "What's A Girl To Do (Yuvèe Extended Remix)", artist: "Luvstruck" },
    { position: 5, title: "Open Up Your Love", artist: "Chaney" },
    { position: 6, title: "Ain't No Stopping Us Now", artist: "BOB SHEPHERD X DA CLUBBMASTER" },
    { position: 7, title: "Dapple (Braxton Remix)", artist: "Jody Wisternoff & James Grant" },
    { position: 8, title: "How I Got Over You (Extended Mix)", artist: "Illyus Barrientos" },
    { position: 9, title: "DNCR", artist: "Kaskade" },
    { position: 10, title: "What I Do", artist: "Because of Art" },
    { position: 11, title: "No Horizons", artist: "Braxton feat. Rromarin" },
    { position: 12, title: "Track II", artist: "Braxton" },
    { position: 13, title: "Never B Alone", artist: "Durante" },
    { position: 14, title: "Conscindo (Ginchy Extended Mix)", artist: "Mark Knight & Wolfgang Gartner" },
    { position: 15, title: "You Hear Me (Original Mix)", artist: "Roads We Walk & Sha7an" },
    { position: 16, title: "Sweetest Thing", artist: "Jody Wisternoff" },
    { position: 17, title: "The Sky Below", artist: "Jody Wisternoff feat. ALLKNIGHT" },
    { position: 18, title: "Shapeshift", artist: "Rezident" },
    { position: 19, title: "Rain (Blake.08 Extended Mix)", artist: "Jody Wisternoff feat. SIan Evans" },
    { position: 20, title: "Need Your Loving", artist: "Joseph Ray" },
    { position: 21, title: "Lean Into Light (Dosem Extended Mix)", artist: "Qrion feat. pinkpirate" },
    { position: 22, title: "Fired Up", artist: "Because of Art" },
    { position: 23, title: "Zero Two", artist: "Because of Art" },
    { position: 24, title: "Home", artist: "Meanetik" },
    { position: 25, title: "Today Is Enough", artist: "Cornelius SA & Elliot Vast" },
    { position: 26, title: "Destiny (with SACHA)", artist: "Alesso" },
    { position: 27, title: "Knockout (Extended Mix)", artist: "Emanuel Satie & Maga & Mâhfoud" },
    { position: 28, title: "Bass In The Area", artist: "Blake.08 feat. Claxy" },
    { position: 29, title: "Imprint (Extended Mix)", artist: "Kaskade & Courtney Storm" },
    { position: 30, title: "Cahethel", artist: "Hana" },
    { position: 31, title: "Explorations", artist: "Blake.08" },
    { position: 32, title: "Uluwatu Rain (Extended Mix)", artist: "Chris Luno & Elliot Chapman" },
    { position: 33, title: "Make Me Feel", artist: "oskar med k" },
    { position: 34, title: "Floodlights", artist: "Marsh" },
    { position: 35, title: "Jungle", artist: "John Monkman" }
  ];

  const episodeDate = "January 31, 2025";
  const episodeUrl = `${window.location.origin}/episode/393`;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <SEO 
        title="Episode 393 - Future Dance Anthems with Mario"
        description="Listen to Episode 393 of Future Dance Anthems with Mario featuring 35 dance tracks including Hana, Chaney, Bruno Martini, Kaskade, and more. Released January 31, 2025."
        keywords="episode 393, future dance anthems, Mario, dance music, EDM, Hana, Chaney, Kaskade, Jody Wisternoff"
        image="/lovable-uploads/mario-show.jpg"
        url={episodeUrl}
      />

      {/* Background Image */}
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
          {/* Hero Section */}
          <section className="py-20 relative">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 animate-fade-in">
                  <div className="inline-block bg-gradient-to-r from-neon to-neon-purple text-background px-6 py-2 rounded-full font-['Orbitron'] font-bold text-sm mb-6">
                    EPISODE #393
                  </div>
                  <h1 className="text-4xl md:text-6xl font-['Orbitron'] font-bold mb-6">
                    <span className="text-neon">FUTURE DANCE</span>{" "}
                    <span className="text-neon-purple">ANTHEMS</span>
                  </h1>
                  <p className="text-xl text-muted-foreground font-['Rajdhani'] mb-4">
                    Episode 393 - {episodeDate}
                  </p>
                  <p className="text-lg text-muted-foreground font-['Rajdhani'] max-w-2xl mx-auto">
                    Dance anthems that consistently rule the dance and electronic scene. Featuring infectious beats, catchy hooks, and high-energy vibes perfect for both clubbing and radio airplay.
                  </p>
                </div>

                {/* Audio Player */}
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-8 mb-8">
                  <audio 
                    ref={audioRef}
                    src="https://media.blubrry.com/biggest_tunes_with_mario_135/content.blubrry.com/biggest_tunes_with_mario_135/fda393.mp3"
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                  />
                  
                  <div className="flex flex-col items-center gap-6">
                    <Button
                      size="lg"
                      onClick={handlePlayPause}
                      disabled={isLoading}
                      className="w-20 h-20 rounded-full text-lg hover:scale-110 transition-transform"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-background" />
                      ) : isPlaying ? (
                        <Pause className="w-8 h-8" />
                      ) : (
                        <Play className="w-8 h-8 ml-1" />
                      )}
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Listen on your favorite podcast platform
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('https://podcasts.apple.com/us/podcast/future-dance-anthems-with-mario/id1439656478', '_blank')}
                        >
                          Apple Podcasts
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('https://open.spotify.com/show/your-show-id', '_blank')}
                        >
                          Spotify
                        </Button>
                        <SocialShare 
                          url={episodeUrl}
                          title="Episode 393 - Future Dance Anthems with Mario"
                          description="Listen to Episode 393 featuring 35 dance tracks including Hana, Chaney, Bruno Martini, and more."
                          image={`${window.location.origin}/lovable-uploads/mario-show.jpg`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Track Listing */}
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-8 mb-8">
                  <h2 className="text-2xl font-['Orbitron'] font-bold mb-6 text-neon-purple">
                    Track Listing
                  </h2>
                  <div className="space-y-3">
                    {tracks.map((track) => (
                      <div 
                        key={track.position}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-neon to-neon-purple flex items-center justify-center font-['Orbitron'] font-bold text-sm text-background">
                          {track.position}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {track.title}
                            {track.isUnreleased && (
                              <span className="ml-2 text-xs bg-neon/20 text-neon px-2 py-1 rounded">
                                Unreleased
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {track.artist}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <AdSenseUnit key="episode-393-ad" slot="6777392184" />

                {/* Episode Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 text-center">
                    <div className="text-2xl font-['Orbitron'] font-bold text-neon mb-1">
                      {tracks.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Tracks</div>
                  </div>
                  <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 text-center">
                    <div className="text-2xl font-['Orbitron'] font-bold text-neon-purple mb-1">
                      {tracks.filter(t => t.isUnreleased).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Unreleased</div>
                  </div>
                  <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 text-center">
                    <div className="text-2xl font-['Orbitron'] font-bold text-primary mb-1">
                      1:00
                    </div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 text-center">
                    <div className="text-2xl font-['Orbitron'] font-bold text-neon mb-1">
                      393
                    </div>
                    <div className="text-xs text-muted-foreground">Episode #</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Episode393;
