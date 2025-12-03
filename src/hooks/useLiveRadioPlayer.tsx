import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

const STREAM_URLS = [
  "http://s9.myradiostream.com:14296/;", 
  "http://s9.myradiostream.com:14296/stream", 
  "http://s9.myradiostream.com:14296", 
  "https://live-radio-stream.online/dance-one-radio.mp3"
];

export const useLiveRadioPlayer = () => {
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
      audioPlayer.playLiveStream(STREAM_URLS);
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
