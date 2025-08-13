import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
// icons via react-native-svg-transformer
import PlayIconAsset from '../../assets/icons/media-control-play-filled.svg';
import PauseIconAsset from '../../assets/icons/media-control-pause-filled.svg';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAudioPlayer } from './AudioPlayerContext';

const PlayIcon = ({ size = 16, color = '#111827' }) => (
  <PlayIconAsset width={size} height={size} fill={color} />
);

const PauseIcon = ({ size = 16, color = '#111827' }) => (
  <PauseIconAsset width={size} height={size} fill={color} />
);

interface PlayButtonProps {
  size?: number;
  iconSize?: number;
  color?: string;
  disabled?: boolean;
  forceLoading?: boolean;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
  size = 32,
  iconSize = 16,
  color = '#111827',
  disabled = false,
  forceLoading = false,
}) => {
  const { isPlaying, isLoading, isBuffering, play, pause, audioUrl, isReady } =
    useAudioPlayer();

  const handlePress = async () => {
    if (disabled || isLoading) return;

    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };

  const noUrl = !audioUrl;
  const showLoading = forceLoading || ((isLoading || isBuffering) && !noUrl);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={disabled || isLoading || noUrl || !isReady}
      activeOpacity={0.7}
    >
      {showLoading ? (
        <LoadingSpinner size={iconSize} />
      ) : isPlaying ? (
        <PauseIcon size={iconSize} color={color} />
      ) : (
        <PlayIcon size={iconSize} color={color} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
