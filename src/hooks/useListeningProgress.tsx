import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';


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

  // Auto-save progress whenever this episode is the active source in the global player.
  const audioPlayer = useAudioPlayer();
  const isThisEpisode = audioPlayer.source === 'episode' &&
    audioPlayer.episodeInfo?.number === episodeNumber;
  const saveProgressRef = useRef(saveProgress);
  saveProgressRef.current = saveProgress;
  const wasPlayingRef = useRef(false);
  const restoredRef = useRef(false);

  // Restore saved position once playback of this episode begins
  useEffect(() => {
    if (!isThisEpisode) {
      restoredRef.current = false;
      return;
    }
    if (restoredRef.current) return;
    if (!progress || progress.playback_position <= 5) return;
    const audio = audioPlayer.audioRef.current;
    if (!audio) return;
    if (audioPlayer.duration <= 0) return; // wait until metadata
    audio.currentTime = progress.playback_position;
    restoredRef.current = true;
  }, [isThisEpisode, progress, audioPlayer.duration, audioPlayer.audioRef]);

  // Periodic save while playing
  useEffect(() => {
    if (!user || !isThisEpisode || !audioPlayer.isPlaying) return;
    const interval = setInterval(() => {
      const audio = audioPlayer.audioRef.current;
      if (audio && audio.currentTime > 0 && audio.duration > 0) {
        saveProgressRef.current(audio.currentTime, audio.duration);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user, isThisEpisode, audioPlayer.isPlaying, audioPlayer.audioRef]);

  // Save on pause / unmount
  useEffect(() => {
    if (!user || !isThisEpisode) return;
    const audio = audioPlayer.audioRef.current;
    if (wasPlayingRef.current && !audioPlayer.isPlaying && audio && audio.currentTime > 0 && audio.duration > 0) {
      saveProgressRef.current(audio.currentTime, audio.duration);
    }
    wasPlayingRef.current = audioPlayer.isPlaying;
  }, [user, isThisEpisode, audioPlayer.isPlaying, audioPlayer.audioRef]);

  useEffect(() => {
    return () => {
      if (!isThisEpisode) return;
      const audio = audioPlayer.audioRef.current;
      if (audio && audio.currentTime > 0 && audio.duration > 0) {
        saveProgressRef.current(audio.currentTime, audio.duration);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return {
    progress,
    loading,
    saveProgress,
    markCompleted,
    clearProgress
  };
}
