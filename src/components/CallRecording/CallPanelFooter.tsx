import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import ClipboardCopyIcon from '../../assets/icons/clipboard-copy.svg';
import TargetIcon from '../../assets/icons/target.svg';
import InfoIcon from '../../assets/icons/information.svg';

type Props = {
  onCopyPress?: () => void;
  onTargetPress?: () => void;
  showTarget?: boolean;
  targetActive?: boolean;
};

export const CallPanelFooter: React.FC<Props> = ({
  onCopyPress,
  onTargetPress,
  showTarget = true,
  targetActive = false,
}) => {
  const [copyActive, setCopyActive] = React.useState(false);

  const handleCopy = () => {
    setCopyActive(true);
    try {
      onCopyPress?.();
    } finally {
      setTimeout(() => setCopyActive(false), 100);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <TouchableOpacity
          onPress={handleCopy}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={1}
          style={[styles.copyButton, copyActive && styles.copyButtonActive]}
        >
          <ClipboardCopyIcon width={18} height={18} />
        </TouchableOpacity>

        {showTarget && (
          <TouchableOpacity
            onPress={onTargetPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={1}
            style={[
              styles.targetButton,
              targetActive && styles.targetButtonActive,
            ]}
          >
            <TargetIcon width={18} height={18} />
          </TouchableOpacity>
        )}
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
    backgroundColor: '#fafafa',
    height: 45,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'transparent',
  },
  copyButtonActive: {
    backgroundColor: '#D9D9D9',
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  targetButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'transparent',
  },
  targetButtonActive: {
    backgroundColor: '#D9D9D9',
  },
});

export default CallPanelFooter;
