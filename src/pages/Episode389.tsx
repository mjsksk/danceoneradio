import { ArrowLeft, Calendar, Clock, Music, Play, Pause, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SocialShare from '@/components/SocialShare';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

interface Track {
  position: number;
  title: string;
  artist: string;
  isUnreleased?: boolean;
}

const Episode389 = () => {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Preload background image for better performance
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = '/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png';
  }, []);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;
    
    try {
      setIsLoading(true);
      
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      // Don't automatically redirect on error - let user click the Blubrry button if needed
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '0:00';
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const tracks: Track[] = [
    { position: 1, title: "Medellin", artist: "K Motionz & Capo Lee" },
    { position: 2, title: "Sweet Nothing 2025", artist: "Calvin Harris & D.O.D" },
    { position: 3, title: "Before You Broke My Heart", artist: "Tobiahs" },
    { position: 4, title: "Back To Me", artist: "Rudimental x Jess Glynne" },
    { position: 5, title: "Flood In", artist: "Selena Faider" },
    { position: 6, title: "Hold Me", artist: "Morgan Seatree & Abi Flynn" },
    { position: 7, title: "Hold On, Let Go", artist: "ANOTR feat. WAYNE SNOW & 3DDY" },
    { position: 8, title: "Make Believe", artist: "Luke Dean X Omar" },
    { position: 9, title: "Lonestar", artist: "Mia Kirkland x Danny Byrd" },
    { position: 10, title: "Take One (Original Mix)", artist: "Job De Jong" },
    { position: 11, title: "Time Never Stops (Extended Mix)", artist: "Kaleena Zanders & Yung Bae" },
    { position: 12, title: "I'm Not Alone (MPH Remix)", artist: "Calvin Harris" },
    { position: 13, title: "One Day (Extended Mix)", artist: "Pithman" },
    { position: 14, title: "Love Light In Flight (Paradise)", artist: "Hooky NZ" },
    { position: 15, title: "Same Thing (Original Mix)", artist: "Tomic & Lars van Josten" },
    { position: 16, title: "Follow Me (feat. SACHA) [Extended Mix]", artist: "Martin Jensen, LAWRENT" },
    { position: 17, title: "Got Your Money", artist: "Fedde Le Grand" },
    { position: 18, title: "BOUNCE (Extended)", artist: "Watzgood" },
    { position: 19, title: "Sweet Dreams (feat. Xavier Dunn) [Extended Mix]", artist: "Maison Ware" },
    { position: 20, title: "Cola (ARTBAT Extended Remix)", artist: "CamelPhat & Elderbrook" },
    { position: 21, title: "I Ain't Gonna Hurry (Extended Mix)", artist: "Pietro Morello" },
    { position: 22, title: "Tesla", artist: "Mau P" },
    { position: 23, title: "Run", artist: "Flight Facilities" },
    { position: 24, title: "E.V.O.", artist: "Junior Jack & Pat BDS" },
    { position: 25, title: "Forest Woms (Original Mix)", artist: "Rich Trelo" },
    { position: 26, title: "Always ft. Eric B Turner (Extended Mix)", artist: "OFFAIAH, David Penn & Thando" },
    { position: 27, title: "Nite Life (M-HIGH Remix)", artist: "Kim English" },
    { position: 28, title: "Sutro", artist: "Chloe Battelle" },
    { position: 29, title: "Por Favor (Extended Mix)", artist: "SVNSETS & Saint Joao" },
    { position: 30, title: "Music is Passion", artist: "Tatana" },
    { position: 31, title: "NO CAP ft. Anderson .Paak", artist: "Disclosure" },
    { position: 32, title: "In Too Deep", artist: "Dmor Jaki Nelson" },
    { position: 33, title: "Rolling Thunder (JJ's Playa Extended Mix)", artist: "Jamie Jones & Baby Rose" },
    { position: 34, title: "Morenita (Extended Edit)", artist: "Felipe Allenn x MORENITA" },
    { position: 35, title: "Turn Back Time (Retrospect) (Kokiri Remix)", artist: "Kokiri" },
    { position: 36, title: "Por Eso (Extended Mix)", artist: "Andrea Lane, Zsak" },
    { position: 37, title: "No Bad Vibes (Adriatique & Samm Remix)", artist: "Jazzy x KILIMANJARO" },
    { position: 38, title: "AY AY (Extended)", artist: "MOGUAI" },
    { position: 39, title: "UNRELEASED", artist: "ShubHub", isUnreleased: true },
    { position: 40, title: "Liquor Store (feat. Nate Dogg)", artist: "Kolter" },
    { position: 41, title: "Terraform (Extended Mix)", artist: "Huxley" },
    { position: 42, title: "Some Kinda Feeling (Extended Mix)", artist: "Mousse T., Wankelmut, Francesco Yates" },
    { position: 43, title: "Cassius 1999 (Radio Edit)", artist: "Cassius" },
    { position: 44, title: "My Kind Of High (Extended Mix)", artist: "Russell Small, ROMBE4T, Amy Pearson" },
    { position: 45, title: "I Start To Wonder (Extended Mix)", artist: "Nick Jay x Jean Luc x Zoë Badwi" },
    { position: 46, title: "PASSO BEM SOLTO (MEDUZA Remix)", artist: "ATLXS" },
    { position: 47, title: "Yes Bby", artist: "Demi Riquísimo" },
    { position: 48, title: "Stay Together (luca santiago Remix)", artist: "Beyond Music & Pheelz" },
    { position: 49, title: "All Night (Extended Mix)", artist: "SOHMI" },
    { position: 50, title: "Oh Baby (Extended Mix)", artist: "Archie Holmes" },
    { position: 51, title: "Playa Paradiso", artist: "DJ Tennis" },
    { position: 52, title: "Born To Fly", artist: "Anabel Englund & Mary Droppinz" },
    { position: 53, title: "I Love You", artist: "Belters Only" },
    { position: 54, title: "Still Dreaming", artist: "Habits" }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <SEO 
        title="Anthems of the week 389 - Future Dance Anthems with Mario | Dance One Radio"
        description="Episode 389 featuring 54 tracks of the latest electronic dance music, including exclusive unreleased tracks from top artists."
        image="/lovable-uploads/mario-show.jpg"
        url={window.location.href}
      />
      {/* Optimized Background Image with lazy loading */}
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
          transform: 'translateZ(0)', // Force GPU acceleration
          backfaceVisibility: 'hidden'
        }}
      />
      
      {/* Content overlay */}
      <div className="relative z-10">
        <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 relative">
          <div className="container mx-auto px-4">
            {/* Back Navigation */}
            <div className="mb-8">
              <Link to="/shows">
                <Button variant="ghost" className="mb-4 hover:text-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Shows
                </Button>
              </Link>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-['Orbitron'] font-bold mb-6 text-center">
                <span className="text-neon">Anthems of the week</span>{" "}
                <span className="text-neon-purple">389</span>
              </h1>
              
              <Card className="card-cyber p-6 mb-8">
                <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-neon" />
                    <span>September 7, 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-neon-purple" />
                    <span>2:08:51</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-primary" />
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      EDM • House • Dance
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Meet Mario at Dance One Radio Mario was discovered through a Dance One Radio search for a newly created 
                    show. He went on to land a brand new show called 'Biggest Tunes with Mario on D1R'. In his own words, Mario 
                    describes his style as "Big Room Sexy house", but because of his love for electronic m...
                  </p>
                  
                  <div className="w-full max-w-2xl mx-auto">
                    <audio 
                      ref={audioRef}
                      preload="metadata"
                      onEnded={() => setIsPlaying(false)}
                      onPause={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                    >
                      <source src="https://media.blubrry.com/biggest_tunes_with_mario_135/content.blubrry.com/biggest_tunes_with_mario_135/ep389-anthems-of-the-week.mp3" type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                    
                    <div className="card-cyber p-6 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <Button 
                          variant="ghost"
                          className="w-12 h-12 bg-gradient-to-br from-neon/20 to-neon-purple/20 border border-neon/30 rounded-full flex items-center justify-center hover:from-neon/30 hover:to-neon-purple/30 transition-all duration-200 p-0"
                          onClick={handlePlayPause}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-neon border-t-transparent rounded-full animate-spin" />
                          ) : isPlaying ? (
                            <Pause className="w-6 h-6 text-neon" />
                          ) : (
                            <Play className="w-6 h-6 text-neon" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary">Future Dance Anthems with Mario</h3>
                          <p className="text-sm text-muted-foreground">Episode 389 - Anthems of the week</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-sm font-medium text-neon-purple">2:08:51</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2 mb-4">
                        <div 
                          className="h-2 bg-primary/40 border border-primary/50 rounded-full cursor-pointer group/progress hover:bg-primary/50 transition-colors"
                          onClick={handleSeek}
                        >
                          <div 
                            className="h-full bg-neon-purple rounded-full transition-all duration-150 relative"
                            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                          >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-neon-purple rounded-full shadow-lg shadow-neon-purple/50 opacity-0 group-hover/progress:opacity-100 transition-opacity border-2 border-background" />
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-primary font-medium">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                      
                      <div className="bg-background/50 rounded-lg p-4 border border-neon/20">
                        <div className="text-center mb-4">
                          <p className="text-muted-foreground mb-2">
                            This episode is available on our podcast platforms
                          </p>
                          <div className="flex justify-center gap-4">
                            <Button 
                              asChild 
                              className="bg-gradient-to-r from-neon/20 to-neon-purple/20 border-neon/30 hover:from-neon/30 hover:to-neon-purple/30"
                            >
                              <a 
                                href="https://podcasts.apple.com/us/podcast/future-dance-anthems-with-mario/id1439656478" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <Apple className="w-4 h-4" />
                                Listen on Apple Podcasts
                              </a>
                            </Button>
                            <Button 
                              variant="outline" 
                              asChild
                            >
                              <Link to="/player" className="flex items-center gap-2">
                                <Music className="w-4 h-4" />
                                Live Radio
                              </Link>
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">
                            Subscribe to get notified when new episodes are available
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <SocialShare 
                      url={window.location.href}
                      title="Anthems of the week 389 - Future Dance Anthems with Mario"
                      description="Episode 389 featuring 54 tracks of the latest electronic dance music, including exclusive unreleased tracks."
                      image={`${window.location.origin}/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png`}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <GoogleAds key="episode389-ad" slot="6777392184" />

        {/* Track Listing */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-['Orbitron'] font-bold mb-8 text-center">
                <span className="text-neon-purple">Track Listing</span>
              </h2>
              
              <div className="grid gap-3">
                {tracks.map((track) => (
                  <Card key={track.position} className="card-cyber p-4 hover:scale-[1.01] transition-all duration-200 group">
                    <div className="flex items-center gap-4">
                      {/* Track Number */}
                      <div className="w-12 h-12 bg-gradient-to-br from-neon/20 to-neon-purple/20 border border-neon/30 rounded-full flex items-center justify-center text-neon font-['Orbitron'] font-bold text-sm">
                        {track.position}
                      </div>
                      
                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-primary group-hover:text-neon transition-colors truncate">
                          {track.title}
                          {track.isUnreleased && (
                            <span className="ml-2 px-2 py-1 bg-neon/20 text-neon text-xs rounded-full">
                              UNRELEASED
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.artist}
                        </p>
                      </div>
                      
                      {/* Music Icon */}
                      <div className="w-8 h-8 flex items-center justify-center text-muted-foreground group-hover:text-neon-purple transition-colors">
                        <Music className="w-4 h-4" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Stats Summary */}
              <Card className="card-cyber p-6 mt-8">
                <div className="text-center">
                  <h3 className="text-xl font-['Orbitron'] font-bold mb-4 text-neon-purple">
                    Episode Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <div className="text-2xl font-bold text-neon font-['Orbitron']">
                        {tracks.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Tracks</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neon-purple font-['Orbitron']">
                        {tracks.filter(t => t.isUnreleased).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Unreleased</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary font-['Orbitron']">
                        2:08:51
                      </div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neon font-['Orbitron']">
                        389
                      </div>
                      <div className="text-sm text-muted-foreground">Episode #</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      </div>
    </div>
  );
};

export default Episode389;