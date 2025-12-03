import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface EpisodeProgress {
  id: string;
  episode_number: number;
  episode_title: string;
  audio_url: string;
  playback_position: number;
  duration: number;
  completed: boolean;
  last_listened_at: string;
}

const ContinueListening = () => {
  const { user } = useAuth();
  const audioPlayer = useAudioPlayer();
  const [episodes, setEpisodes] = useState<EpisodeProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEpisodes([]);
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('episode_listening_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', false)
          .order('last_listened_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error fetching progress:', error);
          return;
        }

        setEpisodes(data || []);
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeLeft = (position: number, duration: number) => {
    const remaining = duration - position;
    const mins = Math.floor(remaining / 60);
    return `${mins} min left`;
  };

  const handleResume = (episode: EpisodeProgress) => {
    audioPlayer.playEpisode({
      number: episode.episode_number,
      title: episode.episode_title,
      audioUrl: episode.audio_url,
    });
    
    setTimeout(() => {
      audioPlayer.seek(episode.playback_position);
    }, 500);
  };

  // Don't show if not logged in or no episodes
  if (!user || loading || episodes.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-background/50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary" />
          Continue Listening
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {episodes.map((episode) => {
            const progressPercent = episode.duration > 0 
              ? (episode.playback_position / episode.duration) * 100 
              : 0;
            
            return (
              <div 
                key={episode.id}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/episode/${episode.episode_number}`}
                      className="text-foreground font-semibold hover:text-primary transition-colors line-clamp-2"
                    >
                      Episode {episode.episode_number}
                    </Link>
                    <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
                      {episode.episode_title}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-2 shrink-0 hover:bg-primary/20"
                    onClick={() => handleResume(episode)}
                  >
                    <Play className="w-5 h-5 text-primary" />
                  </Button>
                </div>
                
                <Progress value={progressPercent} className="h-1.5 mb-2" />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(episode.playback_position)}</span>
                  <span>{formatTimeLeft(episode.playback_position, episode.duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ContinueListening;
