import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';
import { useAudioPlayer } from './AudioPlayerContext';
import { calculateProgress, calculatePosition } from './utils';

interface AudioTrackProps {
  height?: number;
  trackColor?: string;
  progressColor?: string;
  thumbColor?: string;
  containerStyle?: any;
}

export const AudioTrack: React.FC<AudioTrackProps> = ({
  height = 2,
  trackColor = '#e5e7eb',
  progressColor = '#3b82f6',
  thumbColor = '#3b82f6',
  containerStyle,
}) => {
  const { currentPosition, totalDuration, seekTo, isLoading } =
    useAudioPlayer();

  // Calculate progress percentage
  const progressPercentage = useMemo(
    () => calculateProgress(currentPosition, totalDuration),
    [currentPosition, totalDuration],
  );

  // Shared values for the slider
  const progress = useSharedValue(progressPercentage);
  const min = useSharedValue(0);
  const max = useSharedValue(100);

  // Update progress when currentPosition changes
  React.useEffect(() => {
    progress.value = progressPercentage;
  }, [progressPercentage, progress]);

  const handleValueChange = useCallback(
    (value: number) => {
      if (totalDuration > 0) {
        const newPosition = calculatePosition(value, totalDuration);
        seekTo(newPosition);
      }
    },
    [totalDuration, seekTo],
  );

  if (isLoading && totalDuration === 0) {
    return (
      <View style={[styles.trackOnlyContainer, containerStyle]}>
        <View style={[styles.trackPlaceholder, { height }]} />
      </View>
    );
  }

  return (
    <View style={[styles.trackOnlyContainer, containerStyle]}>
      <Slider
        style={styles.slider}
        progress={progress}
        minimumValue={min}
        maximumValue={max}
        thumbWidth={10}
        renderBubble={() => null}
        theme={{
          disableMinTrackTintColor: trackColor,
          maximumTrackTintColor: trackColor,
          minimumTrackTintColor: progressColor,
          cacheTrackTintColor: trackColor,
          bubbleBackgroundColor: progressColor,
          heartbeatColor: thumbColor,
        }}
        onSlidingComplete={handleValueChange}
        containerStyle={styles.sliderContainer}
        disable={totalDuration === 0}
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
    height: 6,
    borderRadius: 3,
  },
  trackPlaceholder: {
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginHorizontal: 8,
  },
});
