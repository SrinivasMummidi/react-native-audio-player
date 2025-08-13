import { useAudioPlayer } from '../components/AudioPlayer/AudioPlayerContext';
import type { UseTranscriptAudioReturn } from '../types/types';

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
