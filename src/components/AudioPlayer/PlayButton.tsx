import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAudioPlayer } from './AudioPlayerContext';

const PlayIcon = ({ size = 16, color = '#111827' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 5v14l11-7-11-7Z" fill={color} />
  </Svg>
);

const PauseIcon = ({ size = 16, color = '#111827' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M7 5h4v14H7zM13 5h4v14h-4z" fill={color} />
  </Svg>
);

interface PlayButtonProps {
  size?: number;
  iconSize?: number;
  color?: string;
  loadingColor?: string;
  disabled?: boolean;
  forceLoading?: boolean;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
  size = 32,
  iconSize = 16,
  color = '#111827',
  loadingColor = '#111827',
  disabled = false,
  forceLoading = false,
}) => {
  const { isPlaying, isLoading, isBuffering, play, pause, audioUrl } = useAudioPlayer();
  
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
  disabled={disabled || isLoading || noUrl}
      activeOpacity={0.7}
    >
  {showLoading ? (
        <ActivityIndicator size="small" color={loadingColor} />
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
  },
  disabled: {
    opacity: 0.5,
  },
});
