import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import SparklesIcon from '../../assets/icons/sparkles.svg';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface SummarizeButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const SparkleIcon = ({ size = 18, color = '#676767' }) => (
  <SparklesIcon width={size} height={size} fill={color} />
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
      {isLoading ? <LoadingSpinner size={18} /> : <SparkleIcon />}
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
