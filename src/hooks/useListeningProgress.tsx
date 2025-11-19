import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ListeningProgress {
  id: string;
  user_id: string;
  episode_number: number;
  episode_title: string;
  audio_url: string;
  playback_position: number;
  duration: number;
  completed: boolean;
  last_listened_at: string;
}

interface UseListeningProgressReturn {
  progress: ListeningProgress | null;
  loading: boolean;
  saveProgress: (position: number, duration: number) => Promise<void>;
  markCompleted: () => Promise<void>;
  clearProgress: () => Promise<void>;
}

export function useListeningProgress(
  episodeNumber: number,
  episodeTitle: string,
  audioUrl: string
): UseListeningProgressReturn {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ListeningProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing progress
  useEffect(() => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('episode_listening_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('episode_number', episodeNumber)
          .maybeSingle();

        if (error) {
          console.error('Error fetching progress:', error);
          return;
        }

        setProgress(data);
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user, episodeNumber]);

  const saveProgress = useCallback(async (position: number, duration: number) => {
    if (!user) return;

    try {
      const progressData = {
        user_id: user.id,
        episode_number: episodeNumber,
        episode_title: episodeTitle,
        audio_url: audioUrl,
        playback_position: position,
        duration: duration,
        completed: duration > 0 && position >= duration * 0.95,
        last_listened_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('episode_listening_progress')
        .upsert(progressData, {
          onConflict: 'user_id,episode_number'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving progress:', error);
        return;
      }

      setProgress(data);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [user, episodeNumber, episodeTitle, audioUrl]);

  const markCompleted = useCallback(async () => {
    if (!user || !progress) return;

    try {
      const { data, error } = await supabase
        .from('episode_listening_progress')
        .update({ completed: true })
        .eq('id', progress.id)
        .select()
        .single();

      if (error) {
        console.error('Error marking completed:', error);
        return;
      }

      setProgress(data);
    } catch (error) {
      console.error('Error marking completed:', error);
    }
  }, [user, progress]);

  const clearProgress = useCallback(async () => {
    if (!user || !progress) return;

    try {
      const { error } = await supabase
        .from('episode_listening_progress')
        .delete()
        .eq('id', progress.id);

      if (error) {
        console.error('Error clearing progress:', error);
        return;
      }

      setProgress(null);
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  }, [user, progress]);

  return {
    progress,
    loading,
    saveProgress,
    markCompleted,
    clearProgress
  };
}
