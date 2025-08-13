import React, { useEffect, useMemo, useState } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import { fetchInsights } from '../../services/fetchInsights';
import { MockResponseData } from '../../types/types';
import { useAudioPlayerContext } from '../../context/TranscriptAudioPlayerContext';
import TranscriptView from './TranscriptView';
import CallPanelFooter from '../CallRecording/CallPanelFooter';
import Clipboard from '@react-native-clipboard/clipboard';
import { LoadingSpinner } from '../common/LoadingSpinner';

function Insights() {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | null>(
    'summary',
  );
  const [transcriptData, setTranscriptData] = useState<MockResponseData | null>(
    null,
  );
  const { getAccessToken, connectionId } = useAudioPlayerContext();
  const [autoSync, setAutoSync] = useState<boolean>(true);

  const transcriptPlainText = useMemo(() => {
    if (!transcriptData) return '';
    return transcriptData.data.transcript.data.words.map(w => w.text).join(' ');
  }, [transcriptData]);

  useEffect(() => {
    try {
      fetchInsights({ connectionId, getAccessToken }).then(data => {
        if (data) {
          setTranscriptData(data);
        }
      });
    } catch (error) {
      console.error('Error loading transcript data:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionId]);

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'summary' && styles.activeTabButton,
          ]}
          onPress={() => {
            setActiveTab('summary');
          }}
          activeOpacity={1}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'summary' && styles.activeTabText,
            ]}
          >
            Summary
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'transcript' && styles.activeTabButton,
          ]}
          onPress={() => {
            setActiveTab('transcript');
          }}
          activeOpacity={1}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'transcript' && styles.activeTabText,
            ]}
          >
            Transcript
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'summary' && !transcriptData && (
        <View style={[styles.contentContainer, styles.loadingSection]}>
          <LoadingSpinner size={24} />
        </View>
      )}

      {activeTab === 'summary' && transcriptData && (
        <>
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>
              {transcriptData.data.summary.text}
            </Text>
          </View>
          <CallPanelFooter
            showTarget={false}
            onCopyPress={() => {
              Clipboard.setString(transcriptData.data.summary.text);
              if (Platform.OS === 'android') {
                ToastAndroid.show('Summary copied', ToastAndroid.SHORT);
              } else {
                Alert.alert('Copied', 'Summary copied');
              }
            }}
          />
        </>
      )}

      {activeTab === 'transcript' && !transcriptData && (
        <View
          style={[
            styles.contentContainer,
            styles.transcriptionContainer,
            styles.loadingSection,
          ]}
        >
          <LoadingSpinner size={24} />
        </View>
      )}

      {activeTab === 'transcript' && transcriptData && (
        <>
          <View
            style={{
              ...styles.contentContainer,
              ...styles.transcriptionContainer,
            }}
          >
            <View style={styles.transcriptContainer}>
              <TranscriptView
                words={transcriptData.data.transcript.data.words}
                speakerLabels={transcriptData.data.transcript.speakerLabels}
                autoScroll={autoSync}
                onManualScroll={() => setAutoSync(false)}
              />
            </View>
          </View>
          <CallPanelFooter
            showTarget={true}
            targetActive={autoSync}
            onTargetPress={() => setAutoSync(prev => !prev)}
            onCopyPress={() => {
              Clipboard.setString(transcriptPlainText);
              if (Platform.OS === 'android') {
                ToastAndroid.show('Transcript copied', ToastAndroid.SHORT);
              } else {
                Alert.alert('Copied', 'Transcript copied');
              }
            }}
          />
        </>
      )}
    </View>
  );
}

export default Insights;

const styles = StyleSheet.create({
  summaryContainer: {
    marginHorizontal: 4,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
  },
  tabContainer: {
    backgroundColor: '#fafafa',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 6,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderColor: '#d6dce0',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderColor: '#333',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  contentContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    minHeight: 200,
  },
  transcriptionContainer: {
    paddingRight: 0,
    minHeight: 200,
  },
  loadingSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentText: {
    fontSize: 12,
    lineHeight: 24,
    color: '#111',
  },
  activeTabText: {
    fontWeight: '600',
  },
  transcriptContainer: {
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
