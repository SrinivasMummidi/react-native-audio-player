import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Platform,
  Alert,
  ToastAndroid,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SummarizeButton from './src/components/CallRecording/SummarizeButton';
import { AudioPlayerProvider, AudioPlayerContent } from './src/components/AudioPlayer';
import { AudioPlayerProvider as TranscriptAudioPlayerProvider } from './src/context/TranscriptAudioPlayerContext';
import Insights from './src/components/Transcript/Insights';
import { fetchCallRecordingUrl } from './src/services/fetch-call-recording';
import { AppEnv } from './src/lib/environment';
import { BRANDIDS } from './src/lib/constants';

type AppProps = {
  // Core config (match audio-transcript-player)
  connectionId: string;
  brandId?: string;
  uniquePin?: string;
  mode?: AppEnv; // 'dev-preview' | 'development' | 'staging' | 'beta' | 'live'
  messageSavedTime?: number;
  callRecApiKey?: string; // used in development/dev-preview

  // Auth
  accessToken: string; // provide token; we'll wrap into getAccessToken
};

export default function App({
  accessToken,
  connectionId,
  brandId = BRANDIDS.ANSWER_CONNECT,
  uniquePin,
  mode = 'live',
  messageSavedTime,
  callRecApiKey,
}: AppProps) {
  const getAccessToken = React.useCallback(
    async () => accessToken,
    [accessToken],
  );

  const [audioUrl, setAudioUrl] = React.useState<string | undefined>(undefined);
  const [, setError] = React.useState<string | null>(null);
  const [showSummaryPanel, setShowSummaryPanel] = React.useState(false);
  const [isSummaryLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchCallRecordingUrl({
          connectionId,
          brandId,
          getAccessToken,
          uniquePin,
          mode,
          callRecApiKey,
          messageSavedTime,
        });
        if (!mounted) return;
        setAudioUrl(res.data);
      } catch (e: any) {
        console.log("Error fetching audio URL:", e);
        if (!mounted) return;
        setError(e?.message ?? 'Failed to fetch recording');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [
    connectionId,
    brandId,
    getAccessToken,
    uniquePin,
    mode,
    callRecApiKey,
    messageSavedTime,
  ]);
  const handleAudioError = React.useCallback((err: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(err, ToastAndroid.SHORT);
    } else {
      Alert.alert('Playback error', err);
    }
  }, []);

  const handleSummaryToggle = React.useCallback(() => {
    setShowSummaryPanel(prev => !prev);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.root}>
        <View style={styles.container}>
          <AudioPlayerProvider
            defaultAudioUrl={audioUrl}
            onError={handleAudioError}
          >
            <TranscriptAudioPlayerProvider
              connectionId={connectionId}
              brandId={brandId}
              getAccessToken={getAccessToken}
              uniquePin={uniquePin}
              mode={mode}
              callRecApiKey={callRecApiKey}
              messageSavedTime={messageSavedTime}
              audioSrc={audioUrl}
            >
              <View style={styles.playerContainer}>
                <AudioPlayerContent
                  showPlaybackSpeed
                  showTotalTime={true}
                  sourceLoading={!audioUrl}
                  showErrorText={false}
                />
              </View>
              <SummarizeButton
                onPress={handleSummaryToggle}
                isLoading={isSummaryLoading}
              />
              {showSummaryPanel && (
                <Insights />
              )}
            </TranscriptAudioPlayerProvider>
          </AudioPlayerProvider>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    margin: 10,
    backgroundColor: '#ffffff',
  },
  playerContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#111827',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
