import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import AudioRecorderPlayer, { PlayBackType, RecordBackType } from 'react-native-audio-recorder-player';
import { Alert, Platform, PermissionsAndroid } from 'react-native';

export interface AudioPlayerContextType {
  // Playback state
  isPlaying: boolean;
  currentPosition: number;
  totalDuration: number;
  isLoading: boolean;
  audioUrl: string | null;
  
  // Recording state
  isRecording: boolean;
  recordTime: string;
  recordSecs: number;
  isPaused: boolean;
  
  // Audio settings
  volume: number;
  playbackSpeed: number;
  
  // Actions
  setAudioUrl: (url: string | null) => void;
  startPlayback: () => Promise<void>;
  pausePlayback: () => Promise<void>;
  resumePlayback: () => Promise<void>;
  stopPlayback: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  skipForward: () => Promise<void>;
  skipBackward: () => Promise<void>;
  setVolumeLevel: (volume: number) => Promise<void>;
  setSpeed: (speed: number) => Promise<void>;
  
  // Recording actions
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
}

interface AudioPlayerProviderProps {
  children: React.ReactNode;
  onRecordingComplete?: (filePath: string) => void;
  onError?: (error: string) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({
  children,
  onRecordingComplete,
  onError,
}) => {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00:00');
  const [recordSecs, setRecordSecs] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Audio settings
  const [volume, setVolume] = useState(1.0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  const audioRecorderPlayerRef = useRef(AudioRecorderPlayer);

  // Request permissions for Android
  const requestPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        return (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }, []);

  // Playback functions
  const startPlayback = useCallback(async () => {
    if (!audioUrl) {
      onError?.('No audio file to play');
      return;
    }

    setIsLoading(true);
    try {
      audioRecorderPlayerRef.current.addPlayBackListener((e: PlayBackType) => {
        setCurrentPosition(e.currentPosition);
        setTotalDuration(e.duration);
      });

      audioRecorderPlayerRef.current.addPlaybackEndListener(() => {
        setIsPlaying(false);
        setCurrentPosition(0);
      });

      await audioRecorderPlayerRef.current.startPlayer(audioUrl);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start playback:', error);
      onError?.('Failed to start playback');
    } finally {
      setIsLoading(false);
    }
  }, [audioUrl, onError]);

  const pausePlayback = useCallback(async () => {
    try {
      await audioRecorderPlayerRef.current.pausePlayer();
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to pause playback:', error);
      onError?.('Failed to pause playback');
    }
  }, [onError]);

  const resumePlayback = useCallback(async () => {
    try {
      await audioRecorderPlayerRef.current.resumePlayer();
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to resume playback:', error);
      onError?.('Failed to resume playback');
    }
  }, [onError]);

  const stopPlayback = useCallback(async () => {
    try {
      await audioRecorderPlayerRef.current.stopPlayer();
      audioRecorderPlayerRef.current.removePlayBackListener();
      audioRecorderPlayerRef.current.removePlaybackEndListener();
      setIsPlaying(false);
      setCurrentPosition(0);
    } catch (error) {
      console.error('Failed to stop playback:', error);
      onError?.('Failed to stop playback');
    }
  }, [onError]);

  const seekTo = useCallback(async (position: number) => {
    try {
      await audioRecorderPlayerRef.current.seekToPlayer(position);
    } catch (error) {
      console.error('Failed to seek:', error);
      onError?.('Failed to seek');
    }
  }, [onError]);

  const skipForward = useCallback(async () => {
    const newPosition = Math.min(currentPosition + 10000, totalDuration);
    await seekTo(newPosition);
  }, [currentPosition, totalDuration, seekTo]);

  const skipBackward = useCallback(async () => {
    const newPosition = Math.max(currentPosition - 10000, 0);
    await seekTo(newPosition);
  }, [currentPosition, seekTo]);

  const setVolumeLevel = useCallback(async (vol: number) => {
    setVolume(vol);
    try {
      await audioRecorderPlayerRef.current.setVolume(vol);
    } catch (error) {
      console.error('Failed to set volume:', error);
      onError?.('Failed to set volume');
    }
  }, [onError]);

  const setSpeed = useCallback(async (speed: number) => {
    setPlaybackSpeed(speed);
    try {
      await audioRecorderPlayerRef.current.setPlaybackSpeed(speed);
    } catch (error) {
      console.error('Failed to set playback speed:', error);
      onError?.('Failed to set playback speed');
    }
  }, [onError]);

  // Recording functions
  const startRecording = useCallback(async () => {
    setIsLoading(true);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permissions', 'Microphone permission is required to record audio');
        setIsLoading(false);
        return;
      }

      audioRecorderPlayerRef.current.addRecordBackListener((e: RecordBackType) => {
        setRecordSecs(e.currentPosition);
        setRecordTime(audioRecorderPlayerRef.current.mmssss(Math.floor(e.currentPosition)));
      });

      await audioRecorderPlayerRef.current.startRecorder();
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError?.('Failed to start recording');
    } finally {
      setIsLoading(false);
    }
  }, [requestPermissions, onError]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const result = await audioRecorderPlayerRef.current.stopRecorder();
      audioRecorderPlayerRef.current.removeRecordBackListener();
      setIsRecording(false);
      setRecordSecs(0);
      setRecordTime('00:00:00');
      setIsPaused(false);
      
      onRecordingComplete?.(result);
      return result;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      onError?.('Failed to stop recording');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onRecordingComplete, onError]);

  const pauseRecording = useCallback(async () => {
    try {
      await audioRecorderPlayerRef.current.pauseRecorder();
      setIsPaused(true);
    } catch (error) {
      console.error('Failed to pause recording:', error);
      onError?.('Failed to pause recording');
    }
  }, [onError]);

  const resumeRecording = useCallback(async () => {
    try {
      await audioRecorderPlayerRef.current.resumeRecorder();
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to resume recording:', error);
      onError?.('Failed to resume recording');
    }
  }, [onError]);

  // Cleanup on unmount
  useEffect(() => {
    const audioRecorderPlayer = audioRecorderPlayerRef.current;
    return () => {
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removePlayBackListener();
      audioRecorderPlayer.removePlaybackEndListener();
      audioRecorderPlayer.removeRecordBackListener();
    };
  }, []);

  const contextValue: AudioPlayerContextType = {
    // Playback state
    isPlaying,
    currentPosition,
    totalDuration,
    isLoading,
    audioUrl,
    
    // Recording state
    isRecording,
    recordTime,
    recordSecs,
    isPaused,
    
    // Audio settings
    volume,
    playbackSpeed,
    
    // Actions
    setAudioUrl,
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
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
