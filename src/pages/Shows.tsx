import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, ExternalLink, Calendar, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SocialShare from '@/components/SocialShare';
import SEO from '@/components/SEO';
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

const Shows = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [bgLoaded, setBgLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchEpisodes = async (retryCount = 0) => {
    const maxRetries = 3;
    let success = false;
    setLoading(true);
    
    const rssUrl = 'https://feeds.blubrry.com/feeds/biggest_tunes_with_mario_135.xml';
    
    try {
      console.log('🔄 Fetching RSS feed via Supabase Edge Function...');
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('rss-feed-fetch', {
        body: { url: rssUrl }
      });

      if (error) {
        throw new Error(`Supabase function error: ${error.message}`);
      }

      if (!data || !data.content) {
        throw new Error('No RSS content received');
      }

      const xmlContent = data.content;
      console.log('📄 XML Content preview:', xmlContent.substring(0, 200) + '...');
      
      console.log('📄 XML Content preview:', xmlContent?.substring(0, 200) + '...');
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Check if parsing was successful
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        console.error('XML parsing error:', parserError.textContent);
        throw new Error('Failed to parse RSS feed');
      }
      
      const items = xmlDoc.querySelectorAll('item');
      console.log(`🎵 Found ${items.length} episodes in RSS feed`);
      
      // Log first item details for debugging
      if (items.length > 0) {
        const firstItem = items[0];
        const title = firstItem.querySelector('title')?.textContent;
        const pubDate = firstItem.querySelector('pubDate')?.textContent;
        console.log('📊 Latest episode:', { title, pubDate });
      }
      
      const episodeList: Episode[] = Array.from(items).map((item, index) => {
        const description = item.querySelector('description')?.textContent || '';
        const cleanDescription = description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
        
        const episode = {
          title: item.querySelector('title')?.textContent || '',
          description: cleanDescription,
          pubDate: item.querySelector('pubDate')?.textContent || '',
          enclosure: {
            url: item.querySelector('enclosure')?.getAttribute('url') || '',
            type: item.querySelector('enclosure')?.getAttribute('type') || ''
          },
          duration: item.querySelector('itunes\\:duration, duration')?.textContent || '',
          guid: item.querySelector('guid')?.textContent || `episode-${index}`
        };
        
        if (index < 3) {
          console.log(`Episode ${index + 1}:`, { title: episode.title, pubDate: episode.pubDate });
        }
        
        return episode;
      });
      
      setEpisodes(episodeList.slice(0, 10));
      setTotalEpisodes(episodeList.length);
      console.log(`✅ RSS Update Complete: Updated with ${episodeList.length} total episodes, showing latest 10`);
      success = true;
    } catch (error) {
      console.error('❌ RSS Update Failed:', error);
      
      // Retry mechanism for mobile reliability
      if (retryCount < maxRetries && (error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch')))) {
        console.log(`🔄 Retrying RSS fetch (attempt ${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => {
          fetchEpisodes(retryCount + 1);
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
        return;
      }
      
      // Set empty state on final failure
      setEpisodes([]);
      setTotalEpisodes(0);
    } finally {
      // Only set loading false when we're done with all retries or succeeded
      if (success || retryCount >= maxRetries) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchEpisodes();

    // Set up hourly refresh
    const refreshInterval = setInterval(() => {
      fetchEpisodes();
    }, 3600000); // 1 hour = 3600000ms

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Scroll to episode if hash is present
  useEffect(() => {
    if (episodes.length > 0) {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#episode-')) {
        const episodeElement = document.querySelector(hash);
        if (episodeElement) {
          setTimeout(() => {
            episodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      }
    }
  }, [episodes]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePlayPause = (episodeUrl: string, episodeGuid: string) => {
    // If same episode is playing, toggle play/pause
    if (currentlyPlaying === episodeGuid && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      return;
    }

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Start new episode
    const audio = new Audio(episodeUrl);
    audioRef.current = audio;
    setCurrentlyPlaying(episodeGuid);
    
    audio.play().catch(console.error);
    
    // Handle when audio ends
    audio.addEventListener('ended', () => {
      setCurrentlyPlaying(null);
      audioRef.current = null;
    });

    // Handle errors
    audio.addEventListener('error', () => {
      setCurrentlyPlaying(null);
      audioRef.current = null;
    });
  };

   const handleShareEpisode = async (episode: Episode, episodeIndex: number) => {
     const episodeUrl = `${window.location.origin}/shows#episode-${totalEpisodes - episodeIndex}`;
     const shareData = {
       title: `${episode.title} - Future Dance Anthems with Mario`,
       text: `Listen to "${episode.title}" from Future Dance Anthems with Mario podcast. ${episode.description.substring(0, 100)}...`,
       url: episodeUrl
     };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
        // You could add a toast notification here if you have one
        alert('Episode link copied to clipboard!');
      }
    } catch (error) {
      // Final fallback: just copy the URL
      try {
        await navigator.clipboard.writeText(episodeUrl);
        alert('Episode link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Failed to share or copy:', error, clipboardError);
      }
    }
  };

  // Preload background image for better performance
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = '/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png';
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <SEO 
        title="Future Dance Anthems with Mario - Shows | Dance One Radio"
        description="Weekly episodes featuring the latest in electronic dance music. Dance anthems that consistently rule the dance and electronic scene."
        image="/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png"
        url={`${window.location.origin}/shows`}
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
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-4 hover:scale-105 transition-transform"
                  onClick={() => {
                    if (episodes.length > 0 && episodes[0].enclosure.url) {
                      handlePlayPause(episodes[0].enclosure.url, episodes[0].guid);
                    }
                  }}
                  disabled={loading || episodes.length === 0}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Listen Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-4 hover:scale-105 transition-transform"
                  onClick={() => window.open('https://podcasts.apple.com/us/podcast/future-dance-anthems-with-mario/id1439656478', '_blank')}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Apple Podcasts
                </Button>
                
                <SocialShare 
                  url={episodes.length > 0 ? `${window.location.origin}/shows#episode-${totalEpisodes}` : `${window.location.origin}/shows`}
                  title={episodes.length > 0 ? `${episodes[0].title} - Future Dance Anthems with Mario` : "Future Dance Anthems with Mario - Shows"}
                  description={episodes.length > 0 ? 
                    `Listen to the latest episode: "${episodes[0].title}". ${episodes[0].description.substring(0, 120)}...` :
                    "Weekly episodes featuring the latest in electronic dance music"
                  }
                  className="text-lg px-8 py-4 hover:scale-105 transition-transform"
                />
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
                    {totalEpisodes}
                  </div>
                  <div className="text-muted-foreground">Latest Episodes</div>
                </Card>
                <Card className="card-cyber p-6 text-center">
                  <div className="text-3xl font-['Orbitron'] font-bold text-neon-purple mb-2">
                    Bi-Weekly
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
                             #{totalEpisodes - index}
                           </div>
                        </div>

                        {/* Episode Content */}
                        <div className="flex-1 space-y-4">
                          <div id={`episode-${totalEpisodes - index}`}>
                            {(episode.title.toLowerCase().includes("389") || 
                              episode.title.toLowerCase().includes("anthems of the week 389") ||
                              episode.title.toLowerCase().includes("anthems") && episode.title.includes("389")) ? (
                              <Link 
                                to="/episode/389"
                                className="block group/link"
                                key={`link-${index}-${episode.guid || 'no-guid'}`}
                              >
                                <h3 className="text-xl md:text-2xl font-['Orbitron'] font-bold mb-3 text-primary group-hover/link:text-neon transition-colors cursor-pointer hover:underline">
                                  {episode.title}
                                </h3>
                              </Link>
                            ) : (
                              <h3 className="text-xl md:text-2xl font-['Orbitron'] font-bold mb-3 text-primary group-hover:text-neon transition-colors">
                                {episode.title}
                              </h3>
                            )}
                            
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
                              onClick={() => handlePlayPause(episode.enclosure.url, episode.guid)}
                            >
                              {currentlyPlaying === episode.guid && audioRef.current && !audioRef.current.paused ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                              {currentlyPlaying === episode.guid && audioRef.current && !audioRef.current.paused ? 'Pause' : 'Play'} Episode
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
                            onClick={() => handleShareEpisode(episode, index)}
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
    </div>
  );
};

export default Shows;