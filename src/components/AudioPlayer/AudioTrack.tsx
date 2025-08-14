import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';
import { useAudioPlayer } from './AudioPlayerContext';

interface AudioTrackProps {
  height?: number;
  trackColor?: string;
  progressColor?: string;
  thumbColor?: string;
  containerStyle?: any;
}

export const AudioTrack: React.FC<AudioTrackProps> = ({
  height = 3,
  trackColor = '#ddd',
  progressColor = '#111',
  thumbColor = '#111',
  containerStyle,
}) => {
  const {
    currentPosition,
    totalDuration,
    seekTo,
    isReady,
    setIsSliding,
    setPreviewPosition,
    isPlaying,
    play,
    pause,
  } = useAudioPlayer();
  const isUserInteracting = useRef(false);
  // Throttle preview updates to avoid excessive re-renders while dragging
  const previewThrottle = useRef<NodeJS.Timeout | null>(null);
  const pendingPreview = useRef<number | null>(null);
  const wasPlayingRef = useRef(false);

  const progress = useSharedValue(currentPosition);
  const min = useSharedValue(0);
  const max = useSharedValue(totalDuration);

  useEffect(() => {
    if (!isUserInteracting.current) {
      progress.value = currentPosition;
    }
  }, [currentPosition, progress]);

  useEffect(() => {
    max.value = totalDuration;
  }, [totalDuration, max]);

  useEffect(() => {
    return () => {
      if (previewThrottle.current) clearTimeout(previewThrottle.current);
      previewThrottle.current = null;
    };
  }, []);

  const handleSlidingStart = useCallback(() => {
    isUserInteracting.current = true;
    setIsSliding(true);
    // Remember current playing state and pause to prevent stutters while scrubbing
    wasPlayingRef.current = isPlaying;
    if (isPlaying) {
      pause().catch(() => {});
    }
    if (previewThrottle.current) clearTimeout(previewThrottle.current);
    previewThrottle.current = null;
  }, [isPlaying, pause, setIsSliding]);

  const handleValueChange = useCallback(
    (value: number) => {
      // Clamp to bounds for safety
      const clamped = Math.max(0, Math.min(value, totalDuration));
      progress.value = clamped;

      // Throttle preview state updates to reduce render pressure
      if (!previewThrottle.current) {
        setPreviewPosition(clamped);
        previewThrottle.current = setTimeout(() => {
          previewThrottle.current = null;
          if (pendingPreview.current != null) {
            setPreviewPosition(pendingPreview.current);
            pendingPreview.current = null;
          }
        }, 60); // ~16-60ms feels smooth; 60ms lowers JS churn
      } else {
        pendingPreview.current = clamped;
      }
    },
    [progress, setPreviewPosition, totalDuration],
  );

  const handleSlidingComplete = useCallback(
    async (value: number) => {
      // Flush any pending preview update
      if (previewThrottle.current) {
        clearTimeout(previewThrottle.current);
        previewThrottle.current = null;
      }
      if (pendingPreview.current != null) {
        setPreviewPosition(pendingPreview.current);
        pendingPreview.current = null;
      } else {
        setPreviewPosition(value);
      }

      const clamped = Math.max(0, Math.min(value, totalDuration || 0));
      progress.value = clamped;

      if (totalDuration > 0) {
        await seekTo(clamped);
      }
      isUserInteracting.current = false;
      setIsSliding(false);
      // Resume playback if it was playing before the drag started
      if (wasPlayingRef.current) {
        try {
          await play();
        } catch {}
      }
    },
    [play, progress, seekTo, setIsSliding, setPreviewPosition, totalDuration],
  );

  return (
    <View style={[styles.trackOnlyContainer, containerStyle]}>
      <Slider
        style={styles.slider}
        progress={progress}
        minimumValue={min}
        maximumValue={max}
        thumbWidth={12}
        renderBubble={() => null}
        theme={{
          disableMinTrackTintColor: trackColor,
          maximumTrackTintColor: trackColor,
          minimumTrackTintColor: '#111',
          bubbleBackgroundColor: progressColor,
          heartbeatColor: thumbColor,
        }}
        onSlidingStart={handleSlidingStart}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
        containerStyle={[
          styles.sliderContainer,
          { height: Math.max(6, height + 4) },
        ]}
        disable={!isReady || totalDuration === 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  trackOnlyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  slider: {
    flex: 1,
  },
  sliderContainer: {
    justifyContent: 'center',
    height: 3,
    borderRadius: 2,
  },
});
