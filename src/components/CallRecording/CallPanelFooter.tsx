import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import ClipboardCopyIcon from '../../assets/icons/clipboard-copy.svg';
import TargetIcon from '../../assets/icons/target.svg';
import InfoIcon from '../../assets/icons/information.svg';

type Props = {
  onCopyPress?: () => void;
  onTargetPress?: () => void;
};

export const CallPanelFooter: React.FC<Props> = ({
  onCopyPress,
  onTargetPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <TouchableOpacity
          onPress={onCopyPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ClipboardCopyIcon width={18} height={18} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onTargetPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <TargetIcon width={18} height={18} />
        </TouchableOpacity>
      </View>

      <View style={styles.rightGroup}>
        <InfoIcon width={16} height={16} />
        <Text style={styles.infoText}>Voice-to-text generated.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    height: 56,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginRight: 12,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
    opacity: 1,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default CallPanelFooter;
