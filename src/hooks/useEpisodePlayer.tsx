import { useEffect, useRef, useCallback } from 'react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useListeningProgress } from '@/hooks/useListeningProgress';

interface UseEpisodePlayerProps {
  episodeNumber: number;
  episodeTitle: string;
  audioUrl: string;
}

export const useEpisodePlayer = ({ episodeNumber, episodeTitle, audioUrl }: UseEpisodePlayerProps) => {
  const { user } = useAuth();
  const audioPlayer = useAudioPlayer();
  const { progress, saveProgress } = useListeningProgress(episodeNumber, episodeTitle, audioUrl);

  // Check if this episode is currently playing
  const isThisEpisode = audioPlayer.source === 'episode' && 
    audioPlayer.episodeInfo?.number === episodeNumber;

  const isPlaying = isThisEpisode && audioPlayer.isPlaying;
  const isLoading = isThisEpisode && audioPlayer.isLoading;
  const currentTime = isThisEpisode ? audioPlayer.currentTime : (progress?.playback_position || 0);
  const duration = isThisEpisode ? audioPlayer.duration : (progress?.duration || 0);

  // Track previous playing state to detect pause
  const wasPlayingRef = useRef(false);
  
  // Store saveProgress in a ref to avoid stale closures
  const saveProgressRef = useRef(saveProgress);
  saveProgressRef.current = saveProgress;

  // Save progress periodically when playing (every 5 seconds)
  useEffect(() => {
    if (!user || !isPlaying || !isThisEpisode) return;
    
    const interval = setInterval(() => {
      // Access audio element directly for current values
      const audio = audioPlayer.audioRef.current;
      if (audio && audio.currentTime > 0 && audio.duration > 0) {
        console.log('Saving progress:', audio.currentTime, audio.duration);
        saveProgressRef.current(audio.currentTime, audio.duration);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isPlaying, user, isThisEpisode, audioPlayer.audioRef]);

  // Save progress when pausing (detect state change)
  useEffect(() => {
    if (!user || !isThisEpisode) return;
    
    // Detect when playback stops (was playing, now not playing)
    const audio = audioPlayer.audioRef.current;
    if (wasPlayingRef.current && !audioPlayer.isPlaying && audio && audio.currentTime > 0) {
      console.log('Saving on pause:', audio.currentTime, audio.duration);
      saveProgressRef.current(audio.currentTime, audio.duration);
    }
    
    wasPlayingRef.current = audioPlayer.isPlaying;
  }, [audioPlayer.isPlaying, isThisEpisode, user, audioPlayer.audioRef]);

  const handlePlayPause = () => {
    if (isThisEpisode) {
      if (audioPlayer.isPlaying) {
        audioPlayer.pause();
      } else {
        audioPlayer.resume();
      }
    } else {
      // Start playing this episode
      audioPlayer.playEpisode({
        number: episodeNumber,
        title: episodeTitle,
        audioUrl,
      });
      
      // Restore saved position if available
      if (progress && progress.playback_position > 0) {
        setTimeout(() => {
          audioPlayer.seek(progress.playback_position);
        }, 500);
      }
    }
  };

  const handleSeek = (time: number) => {
    if (isThisEpisode) {
      audioPlayer.seek(time);
    }
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

  return {
    isPlaying,
    isLoading,
    currentTime,
    duration,
    progress,
    handlePlayPause,
    handleSeek,
    formatTime,
  };
};
