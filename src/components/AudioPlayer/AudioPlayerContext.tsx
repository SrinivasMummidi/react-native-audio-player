import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import TrackPlayer, {
  Track as TPTrack,
  Capability,
  usePlaybackState,
  useProgress,
  State as TPState,
} from 'react-native-track-player';
import { playbackRates } from './utils';
import { useAutoScroll } from '../../context/AutoScrollContext';

// TODO: Replace MutableRefObject usage if upstream deprecates; safe internally.
export interface AudioPlayerContextType {
  // Player instance
  // TrackPlayer is module-level singleton, keep for API symmetry
  player: typeof TrackPlayer;

  // Playback state
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  /** True when we have discovered duration for current URL */
  isReady: boolean;
  currentPosition: number; // in milliseconds
  totalDuration: number; // in milliseconds

  // Refs for immediate access (useful for transcript highlighting)
  currentTimeRef: { current: number };

  // Audio settings
  volume: number; // 0-100
  isMuted: boolean;
  playbackSpeed: { id: string; value: number; label: string };

  // Audio source
  audioUrl: string | null;

  // Slider interaction state
  isSliding: boolean;
  previewPosition: number; // Position while sliding (in milliseconds)

  // Error handling
  error: string | null;

  // Actions
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setIsBuffering: (buffering: boolean) => void;
  setCurrentPosition: (position: number) => void;
  setTotalDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
  setPlaybackSpeed: (speed: {
    id: string;
    value: number;
    label: string;
  }) => void;
  setAudioUrl: (url: string | null) => void;
  setError: (error: string | null) => void;
  setIsSliding: (sliding: boolean) => void;
  setPreviewPosition: (position: number) => void;

  // Player methods
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>; // position in milliseconds
  toggleMute: () => Promise<void>;
  cyclePlaybackSpeed: (param: {
    id: string;
    value: number;
    label: string;
  }) => void;
}

interface AudioPlayerProviderProps {
  children: ReactNode;
  defaultAudioUrl?: string;
  onError?: (error: string) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({
  children,
  defaultAudioUrl,
  onError,
}) => {
  // Create stable player instance
  const player = TrackPlayer;
  // State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<number>(0); // ms
  const [totalDuration, setTotalDuration] = useState<number>(0); // ms
  const [isReady, setIsReady] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<{ id: string; value: number; label: string }>(playbackRates[1]); // 1.0x
  const [audioUrl, setAudioUrl] = useState<string | null>(
    defaultAudioUrl || null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSliding, setIsSliding] = useState(false);
  const [previewPosition, setPreviewPosition] = useState(0);
  const { setAutoSync } = useAutoScroll();

  // Refs for cleanup and position tracking
  const isCleanedUpRef = useRef(false);
  // Single source of truth for current position - updates immediately on seeks
  const currentTimeRef = useRef(0);
  // Track if player has been started at least once
  const hasBeenStartedRef = useRef(false);

  const setVolume = useCallback(async (newVolume: number): Promise<void> => {
    setVolumeState(newVolume);
    try {
      await player.setVolume(newVolume / 100);
    } catch (err) {
      console.warn('Failed to set volume:', err);
    }
  }, [player]);

  // Helper to apply playback speed across platform variations
  const applyPlaybackSpeedToPlayer = useCallback(async (rate: number): Promise<void> => {
    try {
      await player.setRate(rate);
    } catch {
      // silent – speed may not be supported on some platforms yet
    }
  }, [player]);

  const ensureSetup = useCallback(async (): Promise<void> => {
    // Idempotent guard – check queue; if succeeds assume setup done.
    try {
      await player.getQueue();
      return;
    } catch {
      // proceed with setup
    }
    await player.setupPlayer();
    await player.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SeekTo,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      progressUpdateEventInterval: 1,
    });
  console.log('[AudioPlayer] TrackPlayer setup complete');
  }, [player]);

  const loadTrack = useCallback(async (url: string): Promise<void> => {
    const track: TPTrack = {
      id: 'single',
      url,
      title: 'Audio',
      artist: ' ',
    };
    await player.reset();
    await player.add([track]);
    // Re-apply options after reset (some platforms clear them on reset)
    try {
      await player.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SeekTo,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
        ],
        progressUpdateEventInterval: 1,
      });
    } catch {}
  }, [player]);

  const play = useCallback(async (): Promise<void> => {
    if (!audioUrl) {
      setError('No audio URL provided');
      return;
    }
    setIsLoading(true);
    setIsBuffering(true);
    setError(null);
    try {
      await ensureSetup();
      const queue = await player.getQueue();
      if (queue.length === 0 || queue[0].url !== audioUrl) {
        await loadTrack(audioUrl);
        hasBeenStartedRef.current = true;
      }
      if (currentTimeRef.current > 0) {
        await player.seekTo(currentTimeRef.current / 1000);
      }
      await player.setVolume(isMuted ? 0 : volume / 100);
      await applyPlaybackSpeedToPlayer(playbackSpeed.value);
      await player.play();
      setIsPlaying(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to play';
      setError(msg);
      onError?.(msg);
    } finally {
      setIsLoading(false);
      setIsBuffering(false);
    }
  }, [audioUrl, applyPlaybackSpeedToPlayer, ensureSetup, isMuted, loadTrack, onError, playbackSpeed.value, volume, player]);

  const pause = useCallback(async (): Promise<void> => {
    try {
      await player.pause();
      setIsPlaying(false);
    } catch (err) {
      console.warn('Failed to pause:', err);
    }
  }, [player]);

  const stop = useCallback(async (): Promise<void> => {
    try {
      await player.stop();
      setIsPlaying(false);
      currentTimeRef.current = 0;
      setCurrentPosition(0);
      hasBeenStartedRef.current = false;
    } catch (err) {
      console.warn('Failed to stop:', err);
    }
  }, [player]);

  const seekTo = useCallback(async (position: number): Promise<void> => {
    currentTimeRef.current = position;
    setCurrentPosition(position);
    setAutoSync(true);
    try {
      const state = await player.getPlaybackState();
      if (state.state && state.state !== TPState.None) {
        await player.seekTo(position / 1000);
      }
    } catch {
      // silent – will apply on play
    }
  }, [player, setAutoSync]);

  const toggleMute = useCallback(async (): Promise<void> => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    try {
      await player.setVolume(newMuted ? 0 : volume / 100);
    } catch (err) {
      console.warn('Failed to toggle mute:', err);
    }
  }, [isMuted, volume, player]);

  const cyclePlaybackSpeed = useCallback(async (speed: {
    id: string;
    value: number;
    label: string;
  }) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      await applyPlaybackSpeedToPlayer(speed.value);
    }
  }, [applyPlaybackSpeedToPlayer, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!isCleanedUpRef.current) {
        isCleanedUpRef.current = true;
        player.reset().catch(() => {});
        currentTimeRef.current = 0;
        hasBeenStartedRef.current = false;
      }
    };
  }, [player]);

  // Helper to probe duration without exposing playback or touching loading flags
  const probeDuration = useCallback(async (url: string): Promise<void> => {
    if (totalDuration > 0 && isReady) return;
    try {
      await ensureSetup();
      await loadTrack(url);
      const first = await player.getTrack(0);
      if (first?.duration) {
        const ms = first.duration * 1000;
        setTotalDuration(ms);
        setIsReady(true);
      }
    } catch {}
  }, [ensureSetup, isReady, loadTrack, player, totalDuration]);

  useEffect(() => {
    const nextUrl = defaultAudioUrl ?? null;
    if (nextUrl !== audioUrl) {
      if (isPlaying) {
        player.stop().catch(() => {});
        setIsPlaying(false);
      }
      currentTimeRef.current = 0;
      setCurrentPosition(0);
      setTotalDuration(0);
      setIsReady(false);
      setError(null);
      setAudioUrl(nextUrl);
      hasBeenStartedRef.current = false;
    }
  }, [defaultAudioUrl, audioUrl, isPlaying, player]);

  // Preload current URL to discover duration; no timers, minimal state changes
  useEffect(() => {
    if (!audioUrl) {
      setIsReady(false);
      setIsLoading(false);
      setTotalDuration(0);
      return;
    }
    if (isReady || totalDuration > 0) return;
    probeDuration(audioUrl);
  }, [audioUrl, isReady, totalDuration, probeDuration]);

  // Derive playing/buffering from hook
  const playbackState = usePlaybackState();
  const progress = useProgress(); // position / duration in seconds

  // Sync hook progress into our ms-based state (minimal conversions)
  useEffect(() => {
    const posMs = progress.position * 1000;
    currentTimeRef.current = posMs;
    setCurrentPosition(posMs);
    if (progress.duration > 0) {
      const durMs = progress.duration * 1000;
      if (durMs !== totalDuration) setTotalDuration(durMs);
      if (!isReady) setIsReady(true);
    }
  }, [progress.position, progress.duration, isReady, totalDuration]);

  useEffect(() => {
    const stateVal = (playbackState as any)?.state ?? playbackState;
    if (stateVal === TPState.Playing) {
      setIsPlaying(true);
      setIsBuffering(false);
    } else if (stateVal === TPState.Buffering) {
      setIsBuffering(true);
    } else if (
      stateVal === TPState.Paused ||
      stateVal === TPState.Stopped ||
      stateVal === TPState.Ended
    ) {
      setIsPlaying(false);
      if (stateVal === TPState.Stopped || stateVal === TPState.Ended) {
        currentTimeRef.current = 0;
        setCurrentPosition(0);
      }
    }
  }, [playbackState]);

  const contextValue: AudioPlayerContextType = React.useMemo(
    () => ({
      player,
      isPlaying,
      isLoading,
      isBuffering,
      isReady,
      currentPosition,
      totalDuration,
      currentTimeRef,
      volume,
      isMuted,
      playbackSpeed,
      audioUrl,
      isSliding,
      previewPosition,
      error,
      setIsPlaying,
      setIsLoading,
      setIsBuffering,
      setCurrentPosition,
      setTotalDuration,
      setVolume,
      setIsMuted,
      setPlaybackSpeed,
      setAudioUrl,
      setError,
      setIsSliding,
      setPreviewPosition,
      play,
      pause,
      stop,
      seekTo,
      toggleMute,
      cyclePlaybackSpeed,
    }),
  [player,isPlaying,isLoading,isBuffering,isReady,currentPosition,totalDuration,volume,isMuted,playbackSpeed,audioUrl,isSliding,previewPosition,error,play,pause,stop,seekTo,toggleMute,cyclePlaybackSpeed,setVolume],
  );

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error(
      'useAudioPlayer must be used within an AudioPlayerProvider',
    );
  }
  return context;
};
