import React from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';
import LoadingIconAsset from '../../assets/icons/loading.svg';

type LoadingSpinnerProps = {
  size?: number; // px
  durationMs?: number; // rotation duration
  style?: ViewStyle;
};

/**
 * Animated spinner based on the project's loading.svg asset.
 * Keeps the icon's native color and shape; adds smooth infinite rotation.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 18,
  durationMs = 900,
  style,
}) => {
  const spin = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin, durationMs]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[{ transform: [{ rotate }] }, style]}>
      {/* keep original svg color by not overriding fill */}
      <LoadingIconAsset width={size} height={size} />
    </Animated.View>
  );
};

export default LoadingSpinner;
