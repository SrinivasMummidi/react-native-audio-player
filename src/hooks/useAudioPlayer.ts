import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AudioRecorderPlayer, {
  PlayBackType,
  type PlaybackEndType,
  type RecordBackType,
  type AVEncodingOption,
  AVEncoderAudioQualityIOSType,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  type AudioSet,
} from 'react-native-audio-recorder-player';

type UseAudioPlayerOptions = {
  uri?: string;
  initialRate?: number; // 0.5 - 2.0
  volume?: number; // 0.0 - 1.0
  enableRecording?: boolean;
};

export function useAudioPlayer(options: UseAudioPlayerOptions = {}) {
  const { uri, initialRate = 1.0, volume = 1.0, enableRecording = false } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordPaused, setIsRecordPaused] = useState(false);
  const [rate, setRate] = useState(initialRate);
  const [playTimeMs, setPlayTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [recordTimeMs, setRecordTimeMs] = useState(0);

  const hasPlayListenerRef = useRef(false);
  const hasPlayEndListenerRef = useRef(false);
  const hasRecordListenerRef = useRef(false);

  // Derived strings
  const playTime = useMemo(() => AudioRecorderPlayer.mmssss(Math.floor(playTimeMs)), [playTimeMs]);
  const duration = useMemo(() => AudioRecorderPlayer.mmssss(Math.floor(durationMs)), [durationMs]);
  const recordTime = useMemo(() => AudioRecorderPlayer.mmssss(Math.floor(recordTimeMs)), [recordTimeMs]);

  // Setup initial volume/rate
  useEffect(() => {
    (async () => {
      try {
  await AudioRecorderPlayer.setVolume(volume);
  await AudioRecorderPlayer.setPlaybackSpeed(initialRate);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPlaybackListeners = useCallback(() => {
    if (!hasPlayListenerRef.current) {
      AudioRecorderPlayer.addPlayBackListener((e: PlayBackType) => {
        setPlayTimeMs(e.currentPosition);
        setDurationMs(e.duration);
      });
      hasPlayListenerRef.current = true;
    }
    if (!hasPlayEndListenerRef.current) {
      AudioRecorderPlayer.addPlaybackEndListener((_e: PlaybackEndType) => {
        setIsPlaying(false);
        setIsPaused(false);
        setPlayTimeMs(0);
      });
      hasPlayEndListenerRef.current = true;
    }
  }, []);

  const removePlaybackListeners = useCallback(() => {
    if (hasPlayListenerRef.current) {
      AudioRecorderPlayer.removePlayBackListener();
      hasPlayListenerRef.current = false;
    }
    if (hasPlayEndListenerRef.current) {
      AudioRecorderPlayer.removePlaybackEndListener();
      hasPlayEndListenerRef.current = false;
    }
  }, []);

  const addRecordListener = useCallback(() => {
    if (!enableRecording || hasRecordListenerRef.current) return;
    AudioRecorderPlayer.addRecordBackListener((e: RecordBackType) => {
      setRecordTimeMs(e.currentPosition);
    });
    hasRecordListenerRef.current = true;
  }, [enableRecording]);

  const removeRecordListener = useCallback(() => {
    if (!hasRecordListenerRef.current) return;
    AudioRecorderPlayer.removeRecordBackListener();
    hasRecordListenerRef.current = false;
  }, []);

  const play = useCallback(async (customUri?: string) => {
    setIsLoading(true);
    try {
      addPlaybackListeners();
      await AudioRecorderPlayer.startPlayer(customUri ?? uri);
      await AudioRecorderPlayer.setPlaybackSpeed(rate);
      setIsPlaying(true);
      setIsPaused(false);
    } finally {
      setIsLoading(false);
    }
  }, [addPlaybackListeners, rate, uri]);

  const pause = useCallback(async () => {
    setIsLoading(true);
    try {
      await AudioRecorderPlayer.pausePlayer();
      setIsPaused(true);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resume = useCallback(async () => {
    setIsLoading(true);
    try {
      await AudioRecorderPlayer.resumePlayer();
      setIsPaused(false);
      setIsPlaying(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stop = useCallback(async () => {
    setIsLoading(true);
    try {
      await AudioRecorderPlayer.stopPlayer();
      removePlaybackListeners();
      setIsPlaying(false);
      setIsPaused(false);
      setPlayTimeMs(0);
      setDurationMs(0);
    } finally {
      setIsLoading(false);
    }
  }, [removePlaybackListeners]);

  const seek = useCallback(async (ms: number) => {
    await AudioRecorderPlayer.seekToPlayer(ms);
  }, []);

  const setSpeed = useCallback(async (next: number) => {
    setRate(next);
    try {
      await AudioRecorderPlayer.setPlaybackSpeed(next);
    } catch {}
  }, []);

  const setPlayerVolume = useCallback(async (v: number) => {
    await AudioRecorderPlayer.setVolume(v);
  }, []);

  // Recording APIs (optional)
  const defaultAudioSet: AudioSet = useMemo(() => ({
    AVSampleRateKeyIOS: 44100,
  // In v4, AVFormatIDKeyIOS expects a string union. Use 'aac' instead of AVEncodingOption.aac
  AVFormatIDKeyIOS: 'aac' as AVEncodingOption,
    AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
    AVNumberOfChannelsKeyIOS: 2,
    AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
    AudioSourceAndroid: AudioSourceAndroidType.MIC,
  }), []);

  const startRecord = useCallback(async (path?: string) => {
    if (!enableRecording) return undefined;
    setIsLoading(true);
    try {
      addRecordListener();
      const res = await AudioRecorderPlayer.startRecorder(path, defaultAudioSet, true);
  setIsRecording(true);
  setIsRecordPaused(false);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, [addRecordListener, defaultAudioSet, enableRecording]);

  const stopRecord = useCallback(async () => {
    if (!enableRecording) return undefined;
    setIsLoading(true);
    try {
      const res = await AudioRecorderPlayer.stopRecorder();
      removeRecordListener();
      setRecordTimeMs(0);
      setIsRecording(false);
      setIsRecordPaused(false);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, [enableRecording, removeRecordListener]);

  const pauseRecord = useCallback(async () => {
    if (!enableRecording) return;
    setIsLoading(true);
    try {
      await AudioRecorderPlayer.pauseRecorder();
      setIsRecordPaused(true);
    } finally {
      setIsLoading(false);
    }
  }, [enableRecording]);

  const resumeRecord = useCallback(async () => {
    if (!enableRecording) return;
    setIsLoading(true);
    try {
      await AudioRecorderPlayer.resumeRecorder();
      setIsRecordPaused(false);
    } finally {
      setIsLoading(false);
    }
  }, [enableRecording]);

  useEffect(() => {
    return () => {
      removePlaybackListeners();
      removeRecordListener();
    };
  }, [removePlaybackListeners, removeRecordListener]);

  return {
    // state
    isLoading,
    isPlaying,
    isPaused,
    rate,
    playTimeMs,
    durationMs,
    recordTimeMs,
    playTime,
    duration,
    recordTime,

    // controls
    play,
    pause,
    resume,
    stop,
    seek,
    setSpeed,
    setPlayerVolume,

    // recording (optional)
    startRecord,
    stopRecord,
  pauseRecord,
  resumeRecord,
  isRecording,
  isRecordPaused,
  };
}

export default useAudioPlayer;
