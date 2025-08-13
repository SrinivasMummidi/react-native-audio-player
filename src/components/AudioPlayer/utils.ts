/**
 * Utility functions for the AudioPlayer component
 * Based on the web audio player utilities
 */

/**
 * Format time in seconds to mm:ss format
 */
export const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

/**
 * Debounce function for limiting rapid function calls
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  timeout = 300,
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(null, args);
    }, timeout);
  };
}

/**
 * Playback speed options
 */
export const playbackRates = [
  { id: '1', value: 0.5, label: '0.5x' },
  { id: '2', value: 1.0, label: '1x' },
  { id: '3', value: 1.5, label: '1.5x' },
  { id: '4', value: 2.0, label: '2x' },
];

/**
 * Get volume icon name based on volume level
 */
export const getVolumeIconType = (
  volume: number,
): 'off' | 'low' | 'high' | 'max' => {
  if (volume === 0) return 'off';
  if (volume > 0 && volume < 50) return 'low';
  if (volume >= 50 && volume < 75) return 'high';
  return 'max';
};

/**
 * Convert milliseconds to seconds
 */
export const msToSeconds = (ms: number): number => ms / 1000;

/**
 * Convert seconds to milliseconds
 */
export const secondsToMs = (seconds: number): number => seconds * 1000;

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Calculate percentage from current position and duration
 */
export const calculateProgress = (
  currentPosition: number,
  duration: number,
): number => {
  if (duration <= 0) return 0;
  return Math.min(100, (currentPosition / duration) * 100);
};

/**
 * Calculate position from percentage and duration
 */
export const calculatePosition = (
  percentage: number,
  duration: number,
): number => {
  return (percentage / 100) * duration;
};
