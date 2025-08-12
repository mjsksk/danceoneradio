import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, ExternalLink, Calendar, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface Episode {
  title: string;
  description: string;
  pubDate: string;
  enclosure: {
    url: string;
    type: string;
  };
  duration?: string;
  guid: string;
}

const Shows = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const response = await fetch('https://api.allorigins.win/get?url=https://www.danceoneradio.com/feed/podcast/');
        const data = await response.json();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        const episodeList: Episode[] = Array.from(items).map(item => {
          const description = item.querySelector('description')?.textContent || '';
          const cleanDescription = description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
          
          return {
            title: item.querySelector('title')?.textContent || '',
            description: cleanDescription,
            pubDate: item.querySelector('pubDate')?.textContent || '',
            enclosure: {
              url: item.querySelector('enclosure')?.getAttribute('url') || '',
              type: item.querySelector('enclosure')?.getAttribute('type') || ''
            },
            duration: item.querySelector('itunes\\:duration, duration')?.textContent || '',
            guid: item.querySelector('guid')?.textContent || ''
          };
        });
        
        setEpisodes(episodeList.slice(0, 10));
      } catch (error) {
        console.error('Error fetching episodes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-['Orbitron'] font-bold mb-6">
                <span className="text-neon">FUTURE DANCE</span>{" "}
                <span className="text-neon-purple">ANTHEMS</span>
              </h1>
              <p className="text-xl text-muted-foreground font-['Rajdhani'] max-w-3xl mx-auto mb-8">
                Dance anthems that consistently rule the dance and electronic scene. Featuring infectious beats, catchy hooks, and high-energy vibes perfect for both clubbing and radio airplay.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-4 hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 mr-2" />
                  Listen Now
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 hover:scale-105 transition-transform">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Apple Podcasts
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Podcast Stats */}
        <section className="py-12 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="card-cyber p-6 text-center">
                  <div className="text-3xl font-['Orbitron'] font-bold text-neon mb-2">
                    {episodes.length}
                  </div>
                  <div className="text-muted-foreground">Total Episodes</div>
                </Card>
                <Card className="card-cyber p-6 text-center">
                  <div className="text-3xl font-['Orbitron'] font-bold text-neon-purple mb-2">
                    Weekly
                  </div>
                  <div className="text-muted-foreground">Release Schedule</div>
                </Card>
                <Card className="card-cyber p-6 text-center">
                  <div className="text-3xl font-['Orbitron'] font-bold text-primary mb-2">
                    EDM
                  </div>
                  <div className="text-muted-foreground">Genre Focus</div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Episodes List */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-['Orbitron'] font-bold mb-12 text-center">
                <span className="text-neon-purple">LATEST EPISODES</span>
              </h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading episodes...</p>
                </div>
              ) : episodes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No episodes available</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {episodes.map((episode, index) => (
                    <Card key={episode.guid || index} className="card-cyber p-8 hover:scale-[1.01] transition-all duration-300 group">
                      <div className="flex flex-col lg:flex-row gap-8">
                        {/* Episode Number Badge */}
                        <div className="lg:w-20 flex lg:flex-col items-center lg:items-start gap-4">
                          <div className="bg-gradient-to-br from-neon to-neon-purple text-background rounded-full w-16 h-16 flex items-center justify-center font-['Orbitron'] font-bold text-lg">
                            #{episodes.length - index}
                          </div>
                        </div>

                        {/* Episode Content */}
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-xl md:text-2xl font-['Orbitron'] font-bold mb-3 text-primary group-hover:text-neon transition-colors">
                              {episode.title}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-6 mb-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-neon" />
                                <span>{formatDate(episode.pubDate)}</span>
                              </div>
                              {episode.duration && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-neon-purple" />
                                  <span>{episode.duration}</span>
                                </div>
                              )}
                              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                EDM • House • Dance
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground leading-relaxed">
                            {episode.description.length > 300 
                              ? `${episode.description.substring(0, 300)}...` 
                              : episode.description}
                          </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="lg:w-52 flex flex-col gap-3">
                          {episode.enclosure.url && (
                            <Button 
                              className="w-full flex items-center gap-2 hover:scale-105 transition-all duration-200 bg-gradient-to-r from-neon to-neon-purple text-background hover:shadow-lg hover:shadow-neon/25"
                              onClick={() => {
                                const audio = new Audio(episode.enclosure.url);
                                audio.play();
                              }}
                            >
                              <Play className="w-4 h-4" />
                              Play Episode
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            className="w-full flex items-center gap-2 hover:scale-105 transition-all duration-200 border-primary/30 hover:border-primary hover:bg-primary/10"
                            onClick={() => window.open(`https://podcasts.apple.com/podcast/future-dance-anthems-with-mario/id1439656478`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Apple Podcasts
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="w-full text-xs text-muted-foreground hover:text-primary"
                            onClick={() => {
                              navigator.share?.({
                                title: episode.title,
                                url: window.location.href
                              }) || navigator.clipboard.writeText(window.location.href);
                            }}
                          >
                            Share Episode
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Shows;