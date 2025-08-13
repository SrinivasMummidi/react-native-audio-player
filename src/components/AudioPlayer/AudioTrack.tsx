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
  } = useAudioPlayer();
  const isUserInteracting = useRef(false);

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

  const handleSlidingStart = useCallback(() => {
    isUserInteracting.current = true;
    setIsSliding(true);
  }, [setIsSliding]);

  const handleValueChange = useCallback(
    (value: number) => {
      if (isUserInteracting.current) {
        setPreviewPosition(value);
      }
    },
    [setPreviewPosition],
  );

  const handleSlidingComplete = useCallback(
    async (value: number) => {
      isUserInteracting.current = false;
      if (totalDuration > 0) {
        // Don't disable sliding until after seek completes to avoid flicker
        await seekTo(value);
      }
      // Now it's safe to disable sliding since position is updated
      setIsSliding(false);
    },
    [totalDuration, seekTo, setIsSliding],
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
