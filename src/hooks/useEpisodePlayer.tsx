import { useEffect, useRef } from 'react';
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

  // Save progress periodically when playing
  useEffect(() => {
    if (!user || !isPlaying || !isThisEpisode) return;
    
    const interval = setInterval(() => {
      saveProgress(audioPlayer.currentTime, audioPlayer.duration);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isPlaying, user, saveProgress, isThisEpisode, audioPlayer.currentTime, audioPlayer.duration]);

  // Save progress when pausing (detect state change)
  useEffect(() => {
    if (!user || !isThisEpisode) return;
    
    // Detect when playback stops (was playing, now not playing)
    if (wasPlayingRef.current && !audioPlayer.isPlaying && audioPlayer.currentTime > 0) {
      saveProgress(audioPlayer.currentTime, audioPlayer.duration);
    }
    
    wasPlayingRef.current = audioPlayer.isPlaying;
  }, [audioPlayer.isPlaying, isThisEpisode, user, saveProgress, audioPlayer.currentTime, audioPlayer.duration]);

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
