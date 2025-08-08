import React, { useState, useEffect, useCallback } from 'react';
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
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  RecordBackType,
  PlayBackType,
} from 'react-native-audio-recorder-player';
import { PermissionsAndroid } from 'react-native';

// Icons components (you can replace these with actual icon components)
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
  showRecording = true 
}: AudioPlayerProps) {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [recordTime, setRecordTime] = useState('00:00:00');
  const [isPaused, setIsPaused] = useState(false);
  
  // Volume and speed
  const [volume, setVolume] = useState(1.0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  // Slider values for react-native-awesome-slider
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(100);
  const volumeProgress = useSharedValue(75);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Request permissions for Android
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('All permissions granted');
          return true;
        } else {
          console.log('Permissions not granted');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Recording functions
  const onStartRecord = async () => {
    setIsLoading(true);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permissions', 'Microphone permission is required to record audio');
        setIsLoading(false);
        return;
      }

      const audioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVSampleRateKeyIOS: 44100,
        AVFormatIDKeyIOS: AVEncodingOption.aac,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: 2,
      };

      AudioRecorderPlayer.addRecordBackListener((e: RecordBackType) => {
        setRecordSecs(e.currentPosition);
        setRecordTime(AudioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      });

      const result = await AudioRecorderPlayer.startRecorder(undefined, audioSet, true);
      setIsRecording(true);
      console.log('Recording started:', result);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    } finally {
      setIsLoading(false);
    }
  };

  const onStopRecord = async () => {
    setIsLoading(true);
    try {
      const result = await AudioRecorderPlayer.stopRecorder();
      AudioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setRecordSecs(0);
      setRecordTime('00:00:00');
      onRecordingComplete?.(result);
      console.log('Recording stopped:', result);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    } finally {
      setIsLoading(false);
    }
  };

  const onPauseRecord = async () => {
    try {
      await AudioRecorderPlayer.pauseRecorder();
      setIsPaused(true);
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  };

  const onResumeRecord = async () => {
    try {
      await AudioRecorderPlayer.resumeRecorder();
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to resume recording:', error);
    }
  };

  // Playback functions
  const onStartPlay = async () => {
    if (!audioUrl) {
      Alert.alert('Error', 'No audio file to play');
      return;
    }

    setIsLoading(true);
    try {
      AudioRecorderPlayer.addPlayBackListener((e: PlayBackType) => {
        setCurrentPosition(e.currentPosition);
        setTotalDuration(e.duration);
        
        // Update slider progress
        if (e.duration > 0) {
          progress.value = (e.currentPosition / e.duration) * 100;
        }
      });

      const msg = await AudioRecorderPlayer.startPlayer(audioUrl);
      setIsPlaying(true);
      console.log('Playback started:', msg);
    } catch (error) {
      console.error('Failed to start playback:', error);
      Alert.alert('Error', 'Failed to start playback');
    } finally {
      setIsLoading(false);
    }
  };

  const onPausePlay = async () => {
    try {
      await AudioRecorderPlayer.pausePlayer();
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to pause playback:', error);
    }
  };

  const onResumePlay = async () => {
    try {
      await AudioRecorderPlayer.resumePlayer();
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to resume playback:', error);
    }
  };

  const onStopPlay = async () => {
    try {
      await AudioRecorderPlayer.stopPlayer();
      AudioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
      setCurrentPosition(0);
      progress.value = 0;
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  };

  const onSeek = async (value: number) => {
    if (totalDuration > 0) {
      const seekTime = (value / 100) * totalDuration;
      try {
        await AudioRecorderPlayer.seekToPlayer(seekTime);
      } catch (error) {
        console.error('Failed to seek:', error);
      }
    }
  };

  const onSkipForward = async () => {
    const newPosition = Math.min(currentPosition + 10000, totalDuration); // 10 seconds forward
    try {
      await AudioRecorderPlayer.seekToPlayer(newPosition);
    } catch (error) {
      console.error('Failed to skip forward:', error);
    }
  };

  const onSkipBackward = async () => {
    const newPosition = Math.max(currentPosition - 10000, 0); // 10 seconds backward
    try {
      await AudioRecorderPlayer.seekToPlayer(newPosition);
    } catch (error) {
      console.error('Failed to skip backward:', error);
    }
  };

  const setVolumeLevel = async (value: number) => {
    const vol = value / 100;
    setVolume(vol);
    try {
      await AudioRecorderPlayer.setVolume(vol);
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  };

  const setSpeed = async (speed: number) => {
    setPlaybackSpeed(speed);
    try {
      await AudioRecorderPlayer.setPlaybackSpeed(speed);
    } catch (error) {
      console.error('Failed to set playback speed:', error);
    }
  };

  // Update max value when duration changes
  useEffect(() => {
    max.value = totalDuration > 0 ? 100 : 0;
  }, [totalDuration, max]);

  return (
    <View style={styles.container}>
      {/* Recording Section */}
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
                  onPress={isPaused ? onResumeRecord : onPauseRecord}
                >
                  {isPaused ? <PlayIcon /> : <PauseIcon />}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Playback Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Playback</Text>
        <View style={styles.playbackContainer}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentPosition / 1000)}</Text>
            <Text style={styles.timeText}>{formatTime(totalDuration / 1000)}</Text>
          </View>
          
          {/* Progress Slider */}
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

          {/* Playback Controls */}
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

          {/* Volume Control */}
          <View style={styles.volumeContainer}>
            <Text style={styles.label}>Volume</Text>
            <Slider
              style={styles.volumeSlider}
              progress={volumeProgress}
              minimumValue={useSharedValue(0)}
              maximumValue={useSharedValue(100)}
              thumbWidth={16}
              onSlidingComplete={setVolumeLevel}
              theme={{
                maximumTrackTintColor: '#e0e0e0',
                minimumTrackTintColor: '#007AFF',
              }}
            />
          </View>

          {/* Speed Control */}
          <View style={styles.speedContainer}>
            <Text style={styles.label}>Speed: {playbackSpeed}x</Text>
            <View style={styles.speedButtons}>
              {[0.5, 1.0, 1.5, 2.0].map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedButton,
                    playbackSpeed === speed && styles.activeSpeedButton,
                  ]}
                  onPress={() => setSpeed(speed)}
                >
                  <Text style={[
                    styles.speedButtonText,
                    playbackSpeed === speed && styles.activeSpeedButtonText,
                  ]}>
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stop Button */}
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
