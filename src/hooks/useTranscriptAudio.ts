import { useAudioPlayer } from '../components/AudioPlayer/AudioPlayerContext';

interface UseTranscriptAudioReturn {
  currentTime: number;
  seek: (time: number) => void;
}

export const useTranscriptAudio = (): UseTranscriptAudioReturn => {
  const { currentPosition, seekTo } = useAudioPlayer();

  const currentTime = currentPosition / 1000; // Convert milliseconds to seconds

  const seek = (timeInSeconds: number) => {
    const timeInMs = timeInSeconds * 1000;
    seekTo(timeInMs);
  };

  return {
    currentTime,
    seek,
  };
};
