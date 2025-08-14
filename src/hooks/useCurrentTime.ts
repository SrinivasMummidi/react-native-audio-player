import { useCallback, useEffect, useState } from 'react';
import { useAudioPlayer } from '../components/AudioPlayer/AudioPlayerContext';

/**
 * Hook that provides reactive current time updates using both ref and state.
 * This ensures immediate updates for seeking while maintaining React reactivity.
 */
export const useCurrentTime = () => {
  const { currentTimeRef, currentPosition, seekTo } = useAudioPlayer();
  const [reactiveTime, setReactiveTime] = useState(currentTimeRef.current);

  // Update reactive time when currentPosition state changes
  useEffect(() => {
    setReactiveTime(currentPosition);
  }, [currentPosition]);

  // Get current time in seconds for transcript highlighting
  const currentTimeSeconds = reactiveTime / 1000;

  // Helper function to check if current time is within a range
  const isInRange = useCallback((startTime: number, endTime: number) => {
    return currentTimeSeconds >= startTime && currentTimeSeconds <= endTime;
  }, [currentTimeSeconds]);

  // Seek function that provides immediate updates
  const seek = useCallback((timeInSeconds: number) => {
    const timeInMs = timeInSeconds * 1000;
    // Update reactive state immediately for UI feedback
    setReactiveTime(timeInMs);
    // Perform actual seek
    seekTo(timeInMs);
  }, [seekTo]);

  return {
    currentTime: currentTimeSeconds,
    currentTimeMs: reactiveTime,
    isInRange,
    seek,
  };
};
