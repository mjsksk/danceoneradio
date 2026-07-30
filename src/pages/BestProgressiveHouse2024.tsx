import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Headphones, Star, Calendar, Music, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import SocialShare from '@/components/SocialShare';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';

interface TrackEntry {
  rank: number;
  title: string;
  artist: string;
  label: string;
  description: string;
  highlight: string;
}

const BestProgressiveHouse2024 = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tracks: TrackEntry[] = [
    {
      rank: 1,
      title: "Miracle",
      artist: "Calvin Harris & Ellie Goulding",
      label: "Columbia",
      description: "The anthem that defined progressive house in 2024. Calvin Harris returned to his roots with a soaring, emotional masterpiece that dominated festival main stages worldwide.",
      highlight: "Festival Anthem of the Year"
    },
    {
      rank: 2,
      title: "Baby Don't Hurt Me",
      artist: "David Guetta, Anne-Marie & Coi Leray",
      label: "Warner",
      description: "A modern progressive house twist on a classic sample. Guetta proved he's still a master of accessible, radio-ready progressive hooks with enormous floor-filling energy.",
      highlight: "Crossover Hit"
    },
    {
      rank: 3,
      title: "Where You Are",
      artist: "John Summit & Hayla",
      label: "Experts Only / Darkroom",
      description: "John Summit bridged the gap between tech house and progressive with this melodic, emotionally charged vocal cut that became a streaming and club phenomenon.",
      highlight: "Streaming Sensation"
    },
    {
      rank: 4,
      title: "React",
      artist: "Switch Disco, Ella Henderson & Robert Miles",
      label: "Relentless",
      description: "A masterful fusion of trance nostalgia and modern progressive house. The Robert Miles sample gives it timeless emotional depth while the production keeps it firmly in 2024.",
      highlight: "Nostalgic Fusion"
    },
    {
      rank: 5,
      title: "Car Keys (Ayla)",
      artist: "Alok & Ayla",
      label: "B1",
      description: "Brazilian superstar Alok revived the iconic Ayla trance melody in a progressive house wrapper. The result is a track that bridges generations of dance music fans.",
      highlight: "Melodic Revival"
    },
    {
      rank: 6,
      title: "Dancing in the Dark (ID Remix)",
      artist: "Bruce Springsteen (Remix)",
      label: "Unofficial",
      description: "One of the most sought-after progressive bootlegs of the year. This rework transforms the rock classic into a euphoric, hands-in-the-air progressive house anthem.",
      highlight: "Viral Bootleg"
    },
    {
      rank: 7,
      title: "Need You",
      artist: "CASSIMM",
      label: "Toolroom",
      description: "CASSIMM delivered a rolling, groove-laden progressive track with a vocal hook that burrows into your brain. A perfect example of how progressive house evolved in 2024.",
      highlight: "Underground Gem"
    },
    {
      rank: 8,
      title: "All Nighter",
      artist: "Vintage Culture & MAGNUS",
      label: "Tomorrowland Music",
      description: "Brazilian powerhouse Vintage Culture teamed up with MAGNUS for a driving, sun-soaked progressive cut that became a staple of Ibiza and Miami pool parties.",
      highlight: "Summer Essential"
    },
    {
      rank: 9,
      title: "You & I",
      artist: "Meduza, OneRepublic",
      label: "Island",
      description: "Meduza continues their streak of emotionally charged progressive house with Ryan Tedder's unmistakable vocals. A radio-ready hit that never sacrificed its underground credibility.",
      highlight: "Vocal Masterpiece"
    },
    {
      rank: 10,
      title: "Breach (Walk Alone)",
      artist: "Martin Garrix & Blinders",
      label: "STMPD",
      description: "Martin Garrix returned to his progressive roots with Blinders. A thunderous build, euphoric breakdown, and festival-sized drop that reminded everyone why he dominates the genre.",
      highlight: "Festival Bomb"
    }
  ];

  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://danceoneradio.com/news/best-progressive-house-tracks-2024';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Top 10 Progressive House Tracks of 2024 — Curated by Dance One Radio",
    "description": "The definitive countdown of the best progressive house tracks of 2024. Featuring Calvin Harris, David Guetta, John Summit, Meduza, Martin Garrix and more.",
    "image": "https://danceoneradio.com/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png",
    "author": {
      "@type": "Organization",
      "name": "Dance One Radio"
    },
    "publisher": {
      "@type": "RadioStation",
      "name": "Dance One Radio",
      "url": "https://danceoneradio.com",
      "logo": "https://danceoneradio.com/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png"
    },
    "datePublished": "2024-12-20",
    "dateModified": "2024-12-20",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    },
    "articleSection": "Music",
    "keywords": "progressive house 2024, best progressive house songs, top progressive house tracks, dance music 2024, electronic music recommendations"
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Top 10 Progressive House Tracks of 2024 | Dance One Radio"
        description="The definitive countdown of the best progressive house tracks of 2024. Featuring Calvin Harris, David Guetta, John Summit, Meduza, Martin Garrix and more."
        url={pageUrl}
        type="article"
        keywords="best progressive house songs, progressive house 2024, top progressive house tracks, dance music recommendations, electronic music guide"
        structuredData={structuredData}
      />

      <Navigation />

      <main className="pt-16 pb-12">
        {/* Hero */}
        <section className="relative py-12 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="mb-6">
              <Link to="/news">
                <Button variant="ghost" className="hover:text-primary pl-0">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to News
                </Button>
              </Link>
            </div>

            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Music Guide
                </span>
                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  December 2024
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-['Orbitron'] font-bold mb-6 leading-tight">
                <span className="text-neon">Top 10</span>{" "}
                <span className="text-neon-purple">Progressive House</span>{" "}
                <span className="text-foreground">Tracks of 2024</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                Progressive house dominated dance floors in 2024. From Calvin Harris's emotional return 
                to Martin Garrix's festival bombs, these are the tracks that defined the genre this year.
              </p>

              <SocialShare
                url={pageUrl}
                title="Top 10 Progressive House Tracks of 2024 — Dance One Radio"
                description="The definitive countdown of the best progressive house tracks of 2024."
                image={`${typeof window !== 'undefined' ? window.location.origin : 'https://danceoneradio.com'}/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png`}
              />
            </div>
          </div>
        </section>

        <GoogleAds key="article-top" slot={AD_SLOTS.NEWS} />

        {/* Intro */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="card-cyber p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center shrink-0">
                    <Headphones className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-['Orbitron'] font-bold mb-3">What is Progressive House?</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Progressive house is a subgenre of house music characterized by melodic progressions, 
                      emotional builds, and extended structures that evolve over time. Unlike the more repetitive 
                      loops of tech house or the fast tempos of trance, progressive house sits in a sweet 
                      spot—usually 125-130 BPM—with a focus on atmosphere, vocals, and euphoric climaxes.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      In 2024, the genre saw a massive resurgence as artists like Calvin Harris, Meduza, and 
                      John Summit blurred the lines between underground and mainstream, bringing progressive 
                      house back to the top of the charts and festival main stages.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Track Countdown */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Music className="w-6 h-6 text-neon-purple" />
                <h2 className="text-2xl font-['Orbitron'] font-bold">The Countdown</h2>
              </div>

              <div className="space-y-6">
                {tracks.map((track) => (
                  <Card key={track.rank} className="card-cyber p-4 sm:p-6 hover:scale-[1.01] transition-all duration-200 group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-neon/20 to-neon-purple/20 border border-neon/30 rounded-xl flex items-center justify-center shrink-0">
                        <span className="font-['Orbitron'] font-bold text-lg sm:text-xl text-neon">
                          #{track.rank}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-semibold text-primary group-hover:text-neon transition-colors">
                            {track.title}
                          </h3>
                          <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium">
                            {track.highlight}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-1">
                          {track.artist}
                          {track.label && (
                            <span className="text-muted-foreground/60"> • {track.label}</span>
                          )}
                        </p>

                        <p className="text-sm text-muted-foreground/80 leading-relaxed mt-2">
                          {track.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <GoogleAds key="article-mid" slot={AD_SLOTS.IN_CONTENT} format="rectangle" />

        {/* Why These Tracks */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="card-cyber p-6 sm:p-8">
                <h2 className="text-xl font-['Orbitron'] font-bold mb-4">How We Chose These Tracks</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our curation team at Dance One Radio selected these tracks based on a combination of 
                  factors: streaming performance, DJ support, festival appearances, radio airplay, and 
                  cultural impact within the progressive house scene.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We also considered how each track represented a different facet of the genre in 2024—
                  from radio-ready vocal cuts to underground club weapons, from nostalgic samples to 
                  forward-thinking production.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you're a longtime progressive house fan or just discovering the genre, this 
                  playlist is the perfect introduction to what made 2024 such an incredible year for 
                  melodic dance music.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-['Orbitron'] font-bold mb-6">Discover More</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/genres/house">
                  <Card className="card-cyber p-5 hover:border-primary/50 transition-all group h-full">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-neon-purple group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold text-primary group-hover:text-neon transition-colors">House Music Radio</h3>
                        <p className="text-sm text-muted-foreground">Listen to curated house streams</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link to="/genres/trance">
                  <Card className="card-cyber p-5 hover:border-primary/50 transition-all group h-full">
                    <div className="flex items-center gap-3">
                      <Headphones className="w-5 h-5 text-neon group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold text-primary group-hover:text-neon transition-colors">Trance Radio</h3>
                        <p className="text-sm text-muted-foreground">Euphoric trance and uplifting mixes</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link to="/shows">
                  <Card className="card-cyber p-5 hover:border-primary/50 transition-all group h-full">
                    <div className="flex items-center gap-3">
                      <Music className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold text-primary group-hover:text-neon transition-colors">Dance One Shows</h3>
                        <p className="text-sm text-muted-foreground">Exclusive DJ mixes and podcasts</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link to="/news">
                  <Card className="card-cyber p-5 hover:border-primary/50 transition-all group h-full">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold text-primary group-hover:text-neon transition-colors">EDM News</h3>
                        <p className="text-sm text-muted-foreground">Latest updates from the dance world</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link to="/news/history-of-progressive-house">
                  <Card className="card-cyber p-5 hover:border-primary/50 transition-all group h-full">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold text-primary group-hover:text-neon transition-colors">History of Progressive House</h3>
                        <p className="text-sm text-muted-foreground">How the genre evolved from 1990 to today</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <GoogleAds key="article-bottom" slot={AD_SLOTS.AFTER_TRACKLIST} format="rectangle" />
      </main>

      <Footer />
    </div>
  );
};

export default BestProgressiveHouse2024;
