import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { PRIMARY_STREAM_URLS } from '@/config/streamUrls';

export const useLiveRadioPlayer = (streamUrls: string[] = [...PRIMARY_STREAM_URLS]) => {
  const audioPlayer = useAudioPlayer();

  const isLive = audioPlayer.source === 'live';
  const isPlaying = isLive && audioPlayer.isPlaying;
  const isLoading = isLive && audioPlayer.isLoading;

  const handlePlayPause = () => {
    if (isLive) {
      if (audioPlayer.isPlaying) {
        audioPlayer.pause();
      } else {
        audioPlayer.resume();
      }
    } else {
      audioPlayer.playLiveStream(streamUrls);
    }
  };

  return {
    isPlaying,
    isLoading,
    handlePlayPause,
    streamTitle: audioPlayer.streamTitle,
    albumArt: audioPlayer.albumArt,
  };
};
