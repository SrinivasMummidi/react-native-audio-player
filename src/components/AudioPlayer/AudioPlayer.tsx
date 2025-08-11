import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { Slider } from 'react-native-awesome-slider';
import { PermissionsAndroid } from 'react-native';
import useAudioPlayer from '../../hooks/useAudioPlayer';

const PlayIcon = () => <Text style={styles.iconText}>▶️</Text>;
const PauseIcon = () => <Text style={styles.iconText}>⏸️</Text>;
const RecordIcon = () => <Text style={styles.iconText}>🔴</Text>;
const StopIcon = () => <Text style={styles.iconText}>⏹️</Text>;
const SkipBackIcon = () => <Text style={styles.iconText}>⏪</Text>;
const SkipForwardIcon = () => <Text style={styles.iconText}>⏩</Text>;

interface AudioPlayerProps {
  audioUrl?: string;
  onRecordingComplete?: (filePath: string) => void;
  showRecording?: boolean;
}

export default function AudioPlayer({
  audioUrl,
  onRecordingComplete,
  showRecording = true,
}: AudioPlayerProps) {
  const {
    isLoading,
    isPlaying,
    playTimeMs,
    durationMs,
    playTime,
    duration,
    rate,
    isRecording,
    isRecordPaused,
    recordTime,
    play,
    pause,
    stop,
    seek,
    setSpeed,
    setPlayerVolume,
    startRecord,
    stopRecord,
    pauseRecord,
    resumeRecord,
  } = useAudioPlayer({ uri: audioUrl, initialRate: 1.0, enableRecording: showRecording });

  // Slider values
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(100);
  const volumeProgress = useSharedValue(75);
  const volMin = useSharedValue(0);
  const volMax = useSharedValue(100);

  // Android permissions for recording
  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      const ok =
        grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
        grants['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
        grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED;
      return ok;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Recording controls
  const onStartRecord = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permissions', 'Microphone permission is required to record audio');
        return;
      }
      await startRecord();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const onStopRecord = async () => {
    try {
      const result = await stopRecord();
      if (result) onRecordingComplete?.(result);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const onPauseRecord = async () => { await pauseRecord(); };
  const onResumeRecord = async () => { await resumeRecord(); };

  // Playback controls
  const onStartPlay = async () => {
    if (!audioUrl) {
      Alert.alert('Error', 'No audio file to play');
      return;
    }
    await play(audioUrl);
  };

  const onPausePlay = async () => { await pause(); };
  const onStopPlay = async () => { await stop(); progress.value = 0; };

  const onSeek = async (value: number) => {
    if (durationMs > 0) {
      const seekTime = (value / 100) * durationMs;
      try { await seek(seekTime); } catch (error) { console.error('Failed to seek:', error); }
    }
  };

  const onSkipForward = async () => {
    const newPosition = Math.min(playTimeMs + 10000, durationMs);
    try { await seek(newPosition); } catch (error) { console.error('Failed to skip forward:', error); }
  };

  const onSkipBackward = async () => {
    const newPosition = Math.max(playTimeMs - 10000, 0);
    try { await seek(newPosition); } catch (error) { console.error('Failed to skip backward:', error); }
  };

  const setVolumeLevel = async (value: number) => {
    const vol = value / 100;
    try { await setPlayerVolume(vol); } catch (error) { console.error('Failed to set volume:', error); }
  };

  // Update slider values
  useEffect(() => { max.value = durationMs > 0 ? 100 : 0; }, [durationMs, max]);
  useEffect(() => {
    if (durationMs > 0) progress.value = (playTimeMs / durationMs) * 100;
    else progress.value = 0;
  }, [playTimeMs, durationMs, progress]);

  return (
    <View style={styles.container}>
      {showRecording && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recording</Text>
          <View style={styles.recordingContainer}>
            <Text style={styles.timeText}>{recordTime}</Text>
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.button, isRecording ? styles.activeButton : styles.inactiveButton]}
                onPress={isRecording ? onStopRecord : onStartRecord}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : isRecording ? (
                  <StopIcon />
                ) : (
                  <RecordIcon />
                )}
              </TouchableOpacity>

              {isRecording && (
                <TouchableOpacity
                  style={[styles.button, styles.pauseButton]}
                  onPress={isRecordPaused ? onResumeRecord : onPauseRecord}
                >
                  {isRecordPaused ? <PlayIcon /> : <PauseIcon />}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Playback</Text>
        <View style={styles.playbackContainer}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{playTime}</Text>
            <Text style={styles.timeText}>{duration}</Text>
          </View>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              progress={progress}
              minimumValue={min}
              maximumValue={max}
              thumbWidth={20}
              onSlidingComplete={onSeek}
              theme={{
                maximumTrackTintColor: '#e0e0e0',
                minimumTrackTintColor: '#007AFF',
                cacheTrackTintColor: '#c0c0c0',
                bubbleBackgroundColor: '#007AFF',
              }}
            />
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.skipButton} onPress={onSkipBackward}>
              <SkipBackIcon />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.playButton]}
              onPress={isPlaying ? onPausePlay : audioUrl ? onStartPlay : undefined}
              disabled={isLoading || !audioUrl}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : isPlaying ? (
                <PauseIcon />
              ) : (
                <PlayIcon />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={onSkipForward}>
              <SkipForwardIcon />
            </TouchableOpacity>
          </View>

          <View style={styles.volumeContainer}>
            <Text style={styles.label}>Volume</Text>
            <Slider
              style={styles.volumeSlider}
              progress={volumeProgress}
              minimumValue={volMin}
              maximumValue={volMax}
              thumbWidth={16}
              onSlidingComplete={setVolumeLevel}
              theme={{
                maximumTrackTintColor: '#e0e0e0',
                minimumTrackTintColor: '#007AFF',
              }}
            />
          </View>

          <View style={styles.speedContainer}>
            <Text style={styles.label}>Speed: {rate}x</Text>
            <View style={styles.speedButtons}>
              {[0.5, 1.0, 1.5, 2.0].map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedButton,
                    rate === speed && styles.activeSpeedButton,
                  ]}
                  onPress={() => setSpeed(speed)}
                >
                  <Text style={[
                    styles.speedButtonText,
                    rate === speed && styles.activeSpeedButtonText,
                  ]}>
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={onStopPlay}
            disabled={!isPlaying}
          >
            <StopIcon />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  recordingContainer: {
    alignItems: 'center',
  },
  playbackContainer: {
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 16,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  sliderContainer: {
    width: '100%',
    height: 40,
    marginVertical: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  playButton: {
    backgroundColor: '#007AFF',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  activeButton: {
    backgroundColor: '#FF3B30',
  },
  inactiveButton: {
    backgroundColor: '#007AFF',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  stopButton: {
    backgroundColor: '#8E8E93',
    marginTop: 10,
  },
  skipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  volumeContainer: {
    width: '100%',
    marginVertical: 15,
  },
  volumeSlider: {
    width: '100%',
    height: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  speedContainer: {
    width: '100%',
    marginVertical: 10,
  },
  speedButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  speedButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
  },
  activeSpeedButton: {
    backgroundColor: '#007AFF',
  },
  speedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activeSpeedButtonText: {
    color: '#fff',
  },
});
