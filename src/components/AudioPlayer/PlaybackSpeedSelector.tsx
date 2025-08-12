import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAudioPlayer } from './AudioPlayerContext';

interface PlaybackSpeedSelectorProps {
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  fontSize?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  borderRadius?: number;
}

export const PlaybackSpeedSelector: React.FC<PlaybackSpeedSelectorProps> = ({
  textColor = '#111827',
  backgroundColor = 'transparent',
  borderColor = '#d1d5db',
  fontSize = 12,
  paddingHorizontal = 8,
  paddingVertical = 4,
  borderRadius = 4,
}) => {
  const { playbackSpeed, cyclePlaybackSpeed } = useAudioPlayer();
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          paddingHorizontal,
          paddingVertical,
          borderRadius,
        },
      ]}
      onPress={cyclePlaybackSpeed}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize,
          },
        ]}
      >
        {playbackSpeed.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
  },
  text: {
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});
