import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import AudioRecorderPlayer, {
  PlayBackType,
} from 'react-native-audio-recorder-player';
import { playbackRates } from './utils';
import { useAutoScroll } from '../../context/AutoScrollContext';
export interface AudioPlayerContextType {
  // Player instance
  player: AudioRecorderPlayer;

  // Playback state
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  /** True when we have discovered duration for current URL */
  isReady: boolean;
  currentPosition: number; // in milliseconds
  totalDuration: number; // in milliseconds

  // Refs for immediate access (useful for transcript highlighting)
  currentTimeRef: React.MutableRefObject<number>;

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
  const playerRef = useRef(new AudioRecorderPlayer());
  const player = playerRef.current;

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [volume, setVolumeState] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(playbackRates[1]); // 1.0x
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

  const setVolume = useCallback(
    async (newVolume: number) => {
      setVolumeState(newVolume);
      try {
        await player.setVolume(newVolume / 100);
      } catch (err) {
        console.warn('Failed to set volume:', err);
      }
    },
    [player],
  );

  // Helper to apply playback speed across platform variations
  const applyPlaybackSpeedToPlayer = useCallback(
    async (rate: number) => {
      try {
        if ((player as any).setPlaybackSpeed) {
          await (player as any).setPlaybackSpeed(rate);
          return;
        }
        if ((player as any).setRate) {
          await (player as any).setRate(rate);
          return;
        }
        if ((player as any).setSpeed) {
          await (player as any).setSpeed(rate);
          return;
        }
        // Fallback: some versions expose static API
        if ((AudioRecorderPlayer as any).setPlaybackSpeed) {
          await (AudioRecorderPlayer as any).setPlaybackSpeed(rate);
        }
      } catch (err) {
        console.warn('Playback speed not supported:', err);
      }
    },
    [player],
  );

  const play = useCallback(async () => {
    if (!audioUrl) {
      setError('No audio URL provided');
      return;
    }

    setIsLoading(true);
    setIsBuffering(true);
    setError(null);

    try {
      // If we have a known duration and a non-zero position (and not finished), prefer resuming
      const canResume =
        totalDuration > 0 &&
        currentTimeRef.current > 0 &&
        currentTimeRef.current < totalDuration &&
        hasBeenStartedRef.current;

      if (canResume) {
        // Ensure listener is active before resuming (prevents update issues)
        try {
          player.removePlayBackListener();
        } catch {
          // Ignore if no listener was attached
        }

        // Re-attach listener for reliable updates
        player.addPlayBackListener((e: PlayBackType) => {
          // Always update ref and state from player position updates
          currentTimeRef.current = e.currentPosition;
          setCurrentPosition(e.currentPosition);

          if (e.duration > 0) {
            setTotalDuration(e.duration);
          }

          // Stop buffering when we start getting position updates
          if (e.currentPosition > 0) setIsBuffering(false);

          // Handle end of playback
          if (e.duration > 0 && e.currentPosition >= e.duration) {
            setIsPlaying(false);
            currentTimeRef.current = 0;
            setCurrentPosition(0);
            hasBeenStartedRef.current = false; // Reset so next play() starts fresh
            player.stopPlayer().catch(() => { });
            player.removePlayBackListener();
          }
        });

        // Resume existing playback session
        await player.setVolume(isMuted ? 0 : volume / 100).catch(() => { });
        await player.resumePlayer();

        // Sync player to ref position in case they differ
        if (Math.abs(currentPosition - currentTimeRef.current) > 1000) { // 1 second tolerance
          try {
            await player.seekToPlayer(currentTimeRef.current);
            setCurrentPosition(currentTimeRef.current);
          } catch (err) {
            console.warn('Failed to sync position on resume:', err);
          }
        }

        await applyPlaybackSpeedToPlayer(playbackSpeed.value);
        setIsPlaying(true);
        setIsLoading(false);
        setIsBuffering(false);
        return;
      }

      // Fresh start: stop any previous playback and (re)attach listener
      try {
        await player.stopPlayer();
        player.removePlayBackListener();
      } catch {
        // Ignore cleanup errors
      }

      // Add playback listener (fresh)
      player.addPlayBackListener((e: PlayBackType) => {
        // Always update ref and state from player position updates
        // The player only sends updates when it's actually playing
        currentTimeRef.current = e.currentPosition;
        setCurrentPosition(e.currentPosition);

        if (e.duration > 0) {
          setTotalDuration(e.duration);
        }

        // Stop buffering when we start getting position updates
        if (e.currentPosition > 0) setIsBuffering(false);

        // Handle end of playback
        if (e.duration > 0 && e.currentPosition >= e.duration) {
          setIsPlaying(false);
          currentTimeRef.current = 0;
          setCurrentPosition(0);
          hasBeenStartedRef.current = false; // Reset so next play() starts fresh
          player.stopPlayer().catch(() => { });
          player.removePlayBackListener();
        }
      });

      // Start playback
      await player.startPlayer(audioUrl);
      hasBeenStartedRef.current = true;

      // Sync player to ref position if user has seeked before playing
      if (currentTimeRef.current > 0) {
        try {
          await player.seekToPlayer(currentTimeRef.current);
          setCurrentPosition(currentTimeRef.current);
        } catch (err) {
          console.warn('Failed to sync initial position:', err);
        }
      }

      // Apply current settings
      await player.setVolume(isMuted ? 0 : volume / 100);
      await applyPlaybackSpeedToPlayer(playbackSpeed.value);

      setIsPlaying(true);
      setIsLoading(false);
      setIsBuffering(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to start playback';
      setError(errorMessage);
      setIsPlaying(false);
      setIsLoading(false);
      setIsBuffering(false);
      onError?.(errorMessage);
    }
  }, [
    audioUrl,
    player,
    volume,
    isMuted,
    playbackSpeed.value,
    onError,
    totalDuration,
    currentPosition,
    applyPlaybackSpeedToPlayer,
  ]);

  const pause = useCallback(async () => {
    try {
      await player.pausePlayer();
      setIsPlaying(false);
    } catch (err) {
      console.warn('Failed to pause:', err);
    }
  }, [player]);

  const stop = useCallback(async () => {
    try {
      await player.stopPlayer();
      player.removePlayBackListener();
      setIsPlaying(false);
      currentTimeRef.current = 0;
      setCurrentPosition(0);
      hasBeenStartedRef.current = false;
    } catch (err) {
      console.warn('Failed to stop:', err);
    }
  }, [player]);

  const seekTo = useCallback(
    async (position: number) => {
      // Update ref immediately (source of truth for UI)
      currentTimeRef.current = position;

      // Update UI state immediately for responsive feedback
      setCurrentPosition(position);
      setAutoSync(true);

      // Try to seek player if it has been started, but don't block UI
      if (hasBeenStartedRef.current) {
        try {
          await player.seekToPlayer(position);
        } catch (err) {
          console.warn('Seek failed, will apply on next play:', err);
        }
      }
      // If player hasn't started, position will be applied when play() is called
    },
    [player, setAutoSync],
  );

  const toggleMute = useCallback(async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    try {
      await player.setVolume(newMuted ? 0 : volume / 100);
    } catch (err) {
      console.warn('Failed to toggle mute:', err);
    }
  }, [isMuted, volume, player]);

  const cyclePlaybackSpeed = async (speed: {
    id: string;
    value: number;
    label: string;
  }) => {
    setPlaybackSpeed(speed);
    await applyPlaybackSpeedToPlayer(speed.value);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!isCleanedUpRef.current) {
        isCleanedUpRef.current = true;
        player.stopPlayer().catch(() => { });
        player.removePlayBackListener();
        currentTimeRef.current = 0;
        hasBeenStartedRef.current = false;
      }
    };
  }, [player]);

  // Helper to probe duration without exposing playback or touching loading flags
  const probeDuration = useCallback(
    async (url: string) => {
      // Already have it
      if (totalDuration > 0 && isReady) return;
      let gotDuration = false;
      try {
        // Ensure clean state
        try {
          await player.stopPlayer();
          player.removePlayBackListener();
        } catch { }

        const listener = (e: PlayBackType) => {
          if (e.duration && e.duration > 0 && !gotDuration) {
            gotDuration = true;
            setTotalDuration(e.duration);
            currentTimeRef.current = 0;
            setCurrentPosition(0);
            setIsReady(true);
            player.stopPlayer().catch(() => { });
            player.removePlayBackListener();
          }
        };
        player.addPlayBackListener(listener);

        await player.startPlayer(url);
        // Mute during probe to avoid audible blip
        try {
          await player.setVolume(0);
        } catch { }
      } catch (err) {
        // Leave isReady as-is; play() can still establish duration
      }
    },
    [player, totalDuration, isReady],
  );

  useEffect(() => {
    // Allow clearing URL too
    const nextUrl = defaultAudioUrl ?? null;
    if (nextUrl !== audioUrl) {
      // Stop any ongoing playback before switching URL
      if (isPlaying) {
        player.stopPlayer().catch(() => { });
        player.removePlayBackListener();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultAudioUrl]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  const contextValue: AudioPlayerContextType = {
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
    throw new Error(
      'useAudioPlayer must be used within an AudioPlayerProvider',
    );
  }
  return context;
};
