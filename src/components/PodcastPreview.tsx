import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, ExternalLink, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const PodcastPreview = () => {
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
        
        setEpisodes(episodeList.slice(0, 3)); // Only show 3 episodes in preview
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
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="card-cyber p-8 bg-transparent text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading episodes...</p>
      </div>
    );
  }

  return (
    <div className="card-cyber p-6 bg-transparent">
      <div className="mb-6">
        <h3 className="text-2xl font-['Orbitron'] font-bold mb-2">
          <span className="text-neon">RECENT</span>{" "}
          <span className="text-neon-purple">EPISODES</span>
        </h3>
        <p className="text-muted-foreground">Latest from Future Dance Anthems with Mario</p>
      </div>

      <div className="space-y-4 mb-6">
        {episodes.map((episode, index) => (
          <Card key={episode.guid || index} className="bg-background/40 border-primary/20 p-4 hover:bg-background/60 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-neon to-neon-purple text-background rounded-lg w-10 h-10 flex items-center justify-center font-['Orbitron'] font-bold text-sm flex-shrink-0">
                #{3 - index}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-primary group-hover:text-neon transition-colors text-sm mb-1 line-clamp-2">
                  {episode.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(episode.pubDate)}</span>
                  </div>
                  {episode.duration && (
                    <span>{episode.duration}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {episode.description.length > 120 
                    ? `${episode.description.substring(0, 120)}...` 
                    : episode.description}
                </p>
              </div>
              
              <Button 
                size="sm"
                variant="ghost"
                className="p-2 hover:bg-primary/10 hover:text-neon"
                onClick={() => {
                  if (episode.enclosure.url) {
                    const audio = new Audio(episode.enclosure.url);
                    audio.play();
                  }
                }}
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1 hover:scale-105 transition-transform">
          <Link to="/shows">
            <ArrowRight className="w-4 h-4 mr-2" />
            View All Episodes
          </Link>
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 hover:scale-105 transition-transform border-primary/30 hover:border-primary"
          onClick={() => window.open('https://podcasts.apple.com/podcast/future-dance-anthems-with-mario/id1439656478', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Apple Podcasts
        </Button>
      </div>
    </div>
  );
};

export default PodcastPreview;