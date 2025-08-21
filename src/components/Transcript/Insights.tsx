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
import { useAutoScroll } from '../../context/AutoScrollContext';

function Insights() {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | null>(
    'summary',
  );
  const [transcriptData, setTranscriptData] = useState<MockResponseData | null>(
    null,
  );
  const { getAccessToken, connectionId } = useAudioPlayerContext();
  const { autoSync, setAutoSync } = useAutoScroll();

  const transcriptPlainText = useMemo(() => {
    if (!transcriptData) return '';
    return transcriptData.data.transcript.data.words.map(w => w.text).join(' ');
  }, [transcriptData]);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const data = await fetchInsights({ connectionId, getAccessToken });
        if (data) {
          setTranscriptData(data);
        }
      } catch (error) {
        console.error('Error loading transcript data:', error);

        let errorMessage = 'Failed to load insights';

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          // Handle fetch errors or other network errors
          const errorObj = error as any;
          if (
            errorObj.name === 'TypeError' &&
            errorObj.message.includes('fetch')
          ) {
            errorMessage =
              'Network error: Unable to connect to insights service';
          } else {
            errorMessage =
              errorObj.message ||
              errorObj.toString() ||
              'Unknown error occurred';
          }
        }

        if (Platform.OS === 'android') {
          ToastAndroid.show(errorMessage, ToastAndroid.LONG);
        } else {
          Alert.alert('Error Loading Insights', errorMessage);
        }
      }
    };

    loadInsights();
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
                speakerLabels={transcriptData.data.transcript.speakerLabels}
                segments={transcriptData.data.transcript.data.segments || []}
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
