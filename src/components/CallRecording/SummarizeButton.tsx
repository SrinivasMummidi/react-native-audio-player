import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SummarizeButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const SparkleIcon = ({ size = 18, color = '#676767' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l1.8 7.2L21 11.9l-7.2 1.8L12 21l-1.8-7.2L3 11.9l7.2-1.7L12 2z"
      fill={color}
    />
  </Svg>
);

export const SummarizeButton: React.FC<SummarizeButtonProps> = ({
  onPress,
  isLoading = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.summariseBtn}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#111827" />
      ) : (
        <SparkleIcon />
      )}
      <Text style={styles.summariseText}>
        {isLoading ? 'Summarising…' : 'Summarise'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  summariseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  summariseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  newBadge: {
    marginLeft: 6,
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  newBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338CA',
  },
});

export default SummarizeButton;
