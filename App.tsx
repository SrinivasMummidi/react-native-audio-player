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
import CallRecordingPanel from './src/components/CallRecording/CallRecordingPanel';
import SummarizeButton from './src/components/CallRecording/SummarizeButton';
import { AudioPlayerProvider, AudioPlayerContent } from './src/components/AudioPlayer';
import { fetchCallRecordingUrl } from './src/services/fetch-call-recording';
import { INSIGHTS_URL_LIVE, INSIGHTS_URL_STAGING } from './src/lib/constants';

type AppEnv = 'development' | 'staging' | 'production' | 'dev-preview';

type AppProps = {
  // Core config (match audio-transcript-player)
  connectionId: string;
  brandId?: string;
  uniquePin?: string;
  mode?: AppEnv; // 'production' | 'staging' | 'development' | 'dev-preview'
  messageSavedTime?: number;
  callRecApiKey?: string; // used in development/dev-preview

  // Auth
  accessToken: string; // provide token; we'll wrap into getAccessToken
};

export default function App({
  accessToken,
  connectionId,
  brandId,
  uniquePin,
  mode = 'production',
  messageSavedTime,
  callRecApiKey,
}: AppProps) {
  const getAccessToken = React.useCallback(
    async () => accessToken,
    [accessToken],
  );
  const insightsBaseUrl =
    mode === 'production' || mode === 'dev-preview'
      ? INSIGHTS_URL_LIVE
      : INSIGHTS_URL_STAGING;

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
            <View style={styles.section}>
              <AudioPlayerContent
                showPlaybackSpeed
                primaryColor="#111827"
                backgroundColor="#ffffff"
                borderColor="#e5e7eb"
                textColor="#111827"
                showTotalTime={true}
                sourceLoading={!audioUrl}
                showErrorText={false}
              />
            </View>
            <View style={styles.section}>
              <SummarizeButton
                onPress={handleSummaryToggle}
                isLoading={isSummaryLoading}
              />
            </View>
            {showSummaryPanel && (
              <View style={styles.section}>
                <CallRecordingPanel
                  connectionId={connectionId}
                  getAccessToken={getAccessToken}
                  insightsBaseUrl={insightsBaseUrl}
                  isVisible={showSummaryPanel}
                  autoFetchOnShow={true}
                />
              </View>
            )}
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
    padding: 16,
    gap: 24,
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
