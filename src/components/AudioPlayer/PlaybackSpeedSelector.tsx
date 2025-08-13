import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
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
  textColor = '#666',
  backgroundColor = 'transparent',
  borderColor = 'transparent',
  fontSize = 12,
  paddingHorizontal = 8,
  paddingVertical = 4,
  borderRadius = 6,
}) => {
  const { playbackSpeed, cyclePlaybackSpeed } = useAudioPlayer();

  const handlePress = () => {
    Alert.alert(
      'Playback Speed',
      '',
      [
        { text: '0.5x', onPress: () => { cyclePlaybackSpeed({ id: '0.5', value: 0.5, label: '0.5x' }); } },
        { text: '1x', onPress: () => { cyclePlaybackSpeed({ id: '1', value: 1, label: '1x' }); } },
        { text: '1.5x', onPress: () => { cyclePlaybackSpeed({ id: '1.5', value: 1.5, label: '1.5x' }); } },
        { text: '2x', onPress: () => { cyclePlaybackSpeed({ id: '2', value: 2, label: '2x' }); } },
      ]
    );
  };

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
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          styles.verticalAlignText,
          {
            color: textColor,
            fontSize,
            lineHeight: fontSize,
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
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    color: '#666',
    fontVariant: ['tabular-nums'],
  },
  verticalAlignText: {
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
