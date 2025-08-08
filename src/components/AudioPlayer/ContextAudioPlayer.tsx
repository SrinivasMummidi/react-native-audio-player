import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { Slider } from 'react-native-awesome-slider';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

// Icons
const PlayIcon = () => <Text style={styles.iconText}>▶️</Text>;
const PauseIcon = () => <Text style={styles.iconText}>⏸️</Text>;
const RecordIcon = () => <Text style={styles.iconText}>🔴</Text>;
const StopIcon = () => <Text style={styles.iconText}>⏹️</Text>;
const SkipBackIcon = () => <Text style={styles.iconText}>⏪</Text>;
const SkipForwardIcon = () => <Text style={styles.iconText}>⏩</Text>;

interface ContextAudioPlayerProps {
  showRecording?: boolean;
}

export default function ContextAudioPlayer({ showRecording = true }: ContextAudioPlayerProps) {
  const {
    // Playback state
    isPlaying,
    currentPosition,
    totalDuration,
    isLoading,
    audioUrl,
    
    // Recording state
    isRecording,
    recordTime,
    isPaused,
    
    // Audio settings
    volume,
    playbackSpeed,
    
    // Actions
    startPlayback,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    seekTo,
    skipForward,
    skipBackward,
    setVolumeLevel,
    setSpeed,
    
    // Recording actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useAudioPlayer();

  // Slider values
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(100);
  const volumeProgress = useSharedValue(volume * 100);

  // Update progress when position changes
  React.useEffect(() => {
    if (totalDuration > 0) {
      progress.value = (currentPosition / totalDuration) * 100;
    } else {
      progress.value = 0;
    }
  }, [currentPosition, totalDuration, progress]);

  // Update volume slider when volume changes
  React.useEffect(() => {
    volumeProgress.value = volume * 100;
  }, [volume, volumeProgress]);

  // Format time helper
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pausePlayback();
    } else if (currentPosition > 0) {
      resumePlayback();
    } else {
      startPlayback();
    }
  };

  const handleSeek = (value: number) => {
    if (totalDuration > 0) {
      const seekTime = (value / 100) * totalDuration;
      seekTo(seekTime);
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolumeLevel(value / 100);
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleRecordPauseResume = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

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
                onPress={handleRecordToggle}
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
                  onPress={handleRecordPauseResume}
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
            <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
            <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
          </View>
          
          {/* Progress Slider */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              progress={progress}
              minimumValue={min}
              maximumValue={max}
              thumbWidth={20}
              onSlidingComplete={handleSeek}
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
            <TouchableOpacity style={styles.skipButton} onPress={skipBackward}>
              <SkipBackIcon />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.playButton]}
              onPress={handlePlayPause}
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
            
            <TouchableOpacity style={styles.skipButton} onPress={skipForward}>
              <SkipForwardIcon />
            </TouchableOpacity>
          </View>

          {/* Volume Control */}
          <View style={styles.volumeContainer}>
            <Text style={styles.label}>Volume: {Math.round(volume * 100)}%</Text>
            <Slider
              style={styles.volumeSlider}
              progress={volumeProgress}
              minimumValue={useSharedValue(0)}
              maximumValue={useSharedValue(100)}
              thumbWidth={16}
              onSlidingComplete={handleVolumeChange}
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
            onPress={stopPlayback}
            disabled={!isPlaying}
          >
            <StopIcon />
          </TouchableOpacity>

          {/* Current Audio URL */}
          {audioUrl && (
            <Text style={styles.urlText} numberOfLines={2}>
              Playing: {audioUrl}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontFamily: 'Courier',
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
  urlText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
  },
});
