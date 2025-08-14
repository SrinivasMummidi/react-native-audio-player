import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AudioPlayerProvider, useAudioPlayer } from './AudioPlayerContext';
import { PlayButton } from './PlayButton';
import { AudioTrack } from './AudioTrack';
import { PlaybackSpeedSelector } from './PlaybackSpeedSelector';
import { formatTime } from './utils';

interface BaseAudioPlayerProps {
  // Styling props
  containerStyle?: any;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  padding?: number;

  // Component visibility
  showPlaybackSpeed?: boolean;
  showTotalTime?: boolean; // Shows countdown timer (remaining time)
  showCurrentTime?: boolean; // Shows current playback time

  // Color customization
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;

  // Size customization
  height?: number;
  playButtonSize?: number;

  // Error display
  showErrorText?: boolean;

  // Loading indicator when source is being fetched
  sourceLoading?: boolean;
}

export type AudioPlayerProps = BaseAudioPlayerProps & {
  audioUrl?: string;
  onError?: (error: string) => void;
};

export const AudioPlayerContent: React.FC<
  Omit<BaseAudioPlayerProps, 'sourceLoading'> & { sourceLoading?: boolean }
> = ({
  containerStyle,
  backgroundColor = '#ffffff',
  borderColor = '#e9ecef',
  borderRadius = 25,
  padding = 16,
  showPlaybackSpeed = true,
  primaryColor = '#9ca3af',
  secondaryColor = '#6b7280',
  textColor = '#374151',
  height = 42,
  playButtonSize = 20,
  showErrorText = true,
  showTotalTime = false,
  showCurrentTime = false,
  sourceLoading = false,
}) => {
  const {
    error,
    currentPosition,
    totalDuration,
    isReady,
    isSliding,
    previewPosition,
  } = useAudioPlayer();

  // Show preview position when sliding, otherwise show actual position
  const displayPosition = isSliding ? previewPosition : currentPosition;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          borderRadius,
          paddingHorizontal: padding,
          paddingVertical: padding * 0.8,
          height,
        },
        containerStyle,
      ]}
    >
      <View style={styles.controlsRow}>
        <PlayButton
          size={playButtonSize}
          iconSize={playButtonSize}
          color={textColor}
          // Spinner will default to the loading.svg color (#111111)
          forceLoading={!isReady || sourceLoading}
          disabled={!isReady}
        />

        {showCurrentTime && (
          <Text style={[styles.timeText, { color: secondaryColor }]}>
            {formatTime(Math.floor(displayPosition / 1000))}
          </Text>
        )}

        <View style={styles.trackContainer}>
          <AudioTrack
            height={2}
            trackColor={borderColor}
            progressColor={primaryColor}
            thumbColor={primaryColor}
            containerStyle={styles.trackInner}
          />
        </View>

        {showTotalTime && (
          <Text style={[styles.timeText, { color: secondaryColor }]}>
            {formatTime(
              Math.floor(Math.max(0, totalDuration - displayPosition) / 1000),
            )}
          </Text>
        )}

        {showPlaybackSpeed && (
          <PlaybackSpeedSelector
            textColor={textColor}
            backgroundColor="transparent"
            borderColor="transparent"
            fontSize={14}
            paddingHorizontal={4}
            paddingVertical={4}
          />
        )}
      </View>

      {showErrorText && error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  onError,
  ...props
}) => {
  return (
    <AudioPlayerProvider defaultAudioUrl={audioUrl} onError={onError}>
      <AudioPlayerContent {...props} />
    </AudioPlayerProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 0,
    minWidth: 300,
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    minWidth: 35,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  trackContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  trackInner: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    color: '#ef4444',
  },
});

export { AudioPlayerProvider } from './AudioPlayerContext';
export { PlayButton } from './PlayButton';
export { AudioTrack } from './AudioTrack';
export { PlaybackSpeedSelector } from './PlaybackSpeedSelector';
