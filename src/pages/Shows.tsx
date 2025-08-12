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
        
        const episodeList: Episode[] = Array.from(items).map(item => ({
          title: item.querySelector('title')?.textContent || '',
          description: item.querySelector('description')?.textContent || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          enclosure: {
            url: item.querySelector('enclosure')?.getAttribute('url') || '',
            type: item.querySelector('enclosure')?.getAttribute('type') || ''
          },
          duration: item.querySelector('itunes\\:duration, duration')?.textContent || '',
          guid: item.querySelector('guid')?.textContent || ''
        }));
        
        setEpisodes(episodeList);
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
                <span className="text-neon">PODCAST</span>{" "}
                <span className="text-neon-purple">SHOWS</span>
              </h1>
              <p className="text-xl text-muted-foreground font-['Rajdhani'] max-w-2xl mx-auto">
                Listen to Future Dance Anthems with Mario and discover the latest in electronic dance music
              </p>
            </div>
          </div>
        </section>

        {/* Featured Show Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-['Orbitron'] font-bold mb-8 text-center">
                <span className="text-neon">FUTURE DANCE ANTHEMS</span>
              </h2>
              
              <div className="card-cyber p-6 bg-transparent mb-8">
                <iframe 
                  allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" 
                  frameBorder="0" 
                  height="450" 
                  style={{
                    width: '100%',
                    maxWidth: '2500px',
                    overflow: 'hidden',
                    borderRadius: '10px'
                  }} 
                  sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" 
                  src="https://embed.podcasts.apple.com/us/podcast/future-dance-anthems-with-mario/id1439656478" 
                  title="Future Dance Anthems with Mario Podcast" 
                />
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
              ) : (
                <div className="grid gap-6 md:gap-8">
                  {episodes.map((episode, index) => (
                    <Card key={episode.guid || index} className="card-cyber p-6 hover:scale-[1.02] transition-all duration-300">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                          <h3 className="text-xl md:text-2xl font-['Orbitron'] font-bold mb-3 text-primary">
                            {episode.title}
                          </h3>
                          
                          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(episode.pubDate)}</span>
                            </div>
                            {episode.duration && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{episode.duration}</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {episode.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48">
                          {episode.enclosure.url && (
                            <Button 
                              className="flex items-center gap-2 hover:scale-105 transition-transform"
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
                            className="flex items-center gap-2 hover:scale-105 transition-transform"
                            onClick={() => window.open(`https://podcasts.apple.com/podcast/future-dance-anthems-with-mario/id1439656478`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Apple Podcasts
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