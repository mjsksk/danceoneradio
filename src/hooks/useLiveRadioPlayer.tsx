import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { LIVE_STREAM_URLS } from '@/constants/liveStream';

export const useLiveRadioPlayer = (streamUrls: string[] = LIVE_STREAM_URLS) => {
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
    primeLiveStream: () => audioPlayer.primeLiveStream(streamUrls),
    streamTitle: audioPlayer.streamTitle,
    albumArt: audioPlayer.albumArt,
  };
};
