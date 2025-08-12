import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import AudioRecorderPlayer, { PlayBackType } from 'react-native-audio-recorder-player';
import { playbackRates } from './utils';

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
  
  // Audio settings
  volume: number; // 0-100
  isMuted: boolean;
  playbackSpeed: { id: string; value: number; label: string };
  
  // Audio source
  audioUrl: string | null;
  
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
  setPlaybackSpeed: (speed: { id: string; value: number; label: string }) => void;
  setAudioUrl: (url: string | null) => void;
  setError: (error: string | null) => void;
  
  // Player methods
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>; // position in milliseconds
  toggleMute: () => Promise<void>;
  cyclePlaybackSpeed: () => Promise<void>;
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
  const [volume, setVolumeState] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(playbackRates[1]); // 1.0x
  const [audioUrl, setAudioUrl] = useState<string | null>(defaultAudioUrl || null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for cleanup
  const isCleanedUpRef = useRef(false);
  
  const setVolume = useCallback(async (newVolume: number) => {
    setVolumeState(newVolume);
    try {
      await player.setVolume(newVolume / 100);
    } catch (err) {
      console.warn('Failed to set volume:', err);
    }
  }, [player]);
  
  const play = useCallback(async () => {
    if (!audioUrl) {
      setError('No audio URL provided');
      return;
    }
    
    setIsLoading(true);
    setIsBuffering(true);
    setError(null);
    
    try {
      // Stop any previous playback and remove listeners
      try {
        await player.stopPlayer();
        player.removePlayBackListener();
      } catch {
        // Ignore cleanup errors
      }
      
      // Add playback listener
      player.addPlayBackListener((e: PlayBackType) => {
        setCurrentPosition(e.currentPosition);
        if (e.duration > 0) {
          setTotalDuration(e.duration);
        }
        
        // Stop buffering when we start getting position updates
        if (e.currentPosition > 0) setIsBuffering(false);
        
        // Handle end of playback
        if (e.duration > 0 && e.currentPosition >= e.duration) {
          setIsPlaying(false);
          setCurrentPosition(0);
          player.stopPlayer().catch(() => {});
          player.removePlayBackListener();
        }
      });
      
      // Start playback
      await player.startPlayer(audioUrl);
      
      // Apply current settings
      await player.setVolume(isMuted ? 0 : volume / 100);
      
      // Try to set playback speed (may not be supported on all platforms)
      try {
        // Try multiple method names for different platforms/versions
        if ((player as any).setPlaybackSpeed) {
          await (player as any).setPlaybackSpeed(playbackSpeed.value);
        } else if ((player as any).setRate) {
          await (player as any).setRate(playbackSpeed.value);
        } else if ((player as any).setSpeed) {
          await (player as any).setSpeed(playbackSpeed.value);
        }
        console.log(`Applied playback speed: ${playbackSpeed.value}x`);
      } catch (err) {
        console.warn('Playback speed not supported:', err);
      }
      
      setIsPlaying(true);
      setIsLoading(false);
      setIsBuffering(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start playback';
      setError(errorMessage);
      setIsPlaying(false);
      setIsLoading(false);
      setIsBuffering(false);
      onError?.(errorMessage);
    }
  }, [audioUrl, player, volume, isMuted, playbackSpeed, onError]);
  
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
      setCurrentPosition(0);
    } catch (err) {
      console.warn('Failed to stop:', err);
    }
  }, [player]);
  
  const seekTo = useCallback(async (position: number) => {
    try {
      await player.seekToPlayer(position);
      setCurrentPosition(position);
    } catch (err) {
      console.warn('Failed to seek:', err);
    }
  }, [player]);
  
  const toggleMute = useCallback(async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    try {
      await player.setVolume(newMuted ? 0 : volume / 100);
    } catch (err) {
      console.warn('Failed to toggle mute:', err);
    }
  }, [isMuted, volume, player]);
  
  const cyclePlaybackSpeed = useCallback(async () => {
    const currentIndex = playbackRates.findIndex(rate => rate.id === playbackSpeed.id);
    const nextIndex = (currentIndex + 1) % playbackRates.length;
    const nextSpeed = playbackRates[nextIndex];
    
    setPlaybackSpeed(nextSpeed);
    
    // Try to apply the new speed if playing
    if (isPlaying) {
      try {
        if ((player as any).setPlaybackSpeed) {
          await (player as any).setPlaybackSpeed(nextSpeed.value);
        } else if ((player as any).setRate) {
          await (player as any).setRate(nextSpeed.value);
        } else if ((player as any).setSpeed) {
          await (player as any).setSpeed(nextSpeed.value);
        }
        console.log(`Changed playback speed to: ${nextSpeed.value}x`);
      } catch (err) {
        console.warn('Speed change not supported:', err);
      }
    }
  }, [playbackSpeed, isPlaying, player]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!isCleanedUpRef.current) {
        isCleanedUpRef.current = true;
        player.stopPlayer().catch(() => {});
        player.removePlayBackListener();
      }
    };
  }, [player]);

  // Helper to probe duration without exposing playback or touching loading flags
  const probeDuration = useCallback(async (url: string) => {
    // Already have it
    if (totalDuration > 0 && isReady) return;
    let gotDuration = false;
    try {
      // Ensure clean state
      try {
        await player.stopPlayer();
        player.removePlayBackListener();
      } catch {}

      const listener = (e: PlayBackType) => {
        if (e.duration && e.duration > 0 && !gotDuration) {
          gotDuration = true;
          setTotalDuration(e.duration);
          setCurrentPosition(0);
          setIsReady(true);
          player.stopPlayer().catch(() => {});
          player.removePlayBackListener();
        }
      };
      player.addPlayBackListener(listener);

      await player.startPlayer(url);
      // Mute during probe to avoid audible blip
      try { await player.setVolume(0); } catch {}
    } catch (err) {
      // Leave isReady as-is; play() can still establish duration
    }
  }, [player, totalDuration, isReady]);

  // Sync incoming defaultAudioUrl prop to internal state; stop current playback if URL changes
  useEffect(() => {
    // Allow clearing URL too
    const nextUrl = defaultAudioUrl ?? null;
    if (nextUrl !== audioUrl) {
      // Stop any ongoing playback before switching URL
      if (isPlaying) {
        player.stopPlayer().catch(() => {});
        player.removePlayBackListener();
        setIsPlaying(false);
      }
      setCurrentPosition(0);
      setTotalDuration(0);
      setIsReady(false);
      setError(null);
      setAudioUrl(nextUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultAudioUrl]);

  // Preload current URL to discover duration; no timers, minimal state changes
  useEffect(() => {
    if (!audioUrl) return;
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
    volume,
    isMuted,
    playbackSpeed,
    audioUrl,
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
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
