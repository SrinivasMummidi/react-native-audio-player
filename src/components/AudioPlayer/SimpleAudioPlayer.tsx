import React, { useCallback, useEffect, useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';
import AudioRecorderPlayer, { PlayBackType } from 'react-native-audio-recorder-player';
import Svg, { Path } from 'react-native-svg';
// icons via react-native-svg-transformer
import PlayIconAsset from '../../assets/icons/media-control-play-filled.svg';
import PauseIconAsset from '../../assets/icons/media-control-pause-filled.svg';
import LoadingIconAsset from '../../assets/icons/loading.svg';

// Built-in 2-minute preview
const DEFAULT_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
const MAX_PREVIEW_MS = 120_000; // 2 minutes

interface SimpleAudioPlayerProps {
  audioUrl?: string; // optional; defaults to built-in sample
}

const PlayIcon = () => (
  <PlayIconAsset width={16} height={16} fill="#676767" />
);

const PauseIcon = () => (
  <PauseIconAsset width={16} height={16} fill="#676767" />
);

const VolumeOnIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M3 10v4h4l5 4V6L7 10H3Z" fill="#676767" />
    <Path d="M16.5 8.5c1 .9 1.5 2 1.5 3.5s-.5 2.6-1.5 3.5" stroke="#676767" strokeWidth="2" strokeLinecap="round" />
    <Path d="M19.5 6c1.8 1.6 2.5 3.4 2.5 6s-.7 4.4-2.5 6" stroke="#676767" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const VolumeOffIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M3 10v4h4l5 4V6L7 10H3Z" fill="#676767" />
    <Path d="M22 8l-6 6M16 8l6 6" stroke="#676767" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export default function SimpleAudioPlayer({ audioUrl }: SimpleAudioPlayerProps) {
  const url = audioUrl || DEFAULT_AUDIO_URL;

  // Create a stable instance of AudioRecorderPlayer using useRef
  const playerRef = useRef(new AudioRecorderPlayer());
  const player = playerRef.current;

  // UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [rate, setRate] = useState(1.0);

  // slider shared values
  const progress = useSharedValue(0); // 0..100
  const min = useSharedValue(0);
  const max = useSharedValue(100);

  const onStartPlay = useCallback(async () => {
    setIsLoading(true);
    setIsBuffering(true);
    try {
      // stop any previous playback
      try {
        await player.stopPlayer();
        player.removePlayBackListener();
      } catch { }

      // attach listener
      player.addPlayBackListener((e: PlayBackType) => {
        const targetDuration = e.duration > 0 ? Math.min(e.duration, MAX_PREVIEW_MS) : MAX_PREVIEW_MS;
        setTotalDuration(targetDuration);

        // update progress (cap to target duration)
        if (targetDuration > 0) {
          const pct = Math.min(100, (e.currentPosition / targetDuration) * 100);
          progress.value = pct;
        }

        if (isBuffering && e.currentPosition > 0) setIsBuffering(false);

        // end of preview
        if (targetDuration > 0 && e.currentPosition >= targetDuration) {
          setIsPlaying(false);
          progress.value = 0;
          player.stopPlayer().catch(() => { });
          player.removePlayBackListener();
        }
      });

      await player.startPlayer(url);
      // Apply current volume and rate if available
      try { await player.setVolume(isMuted ? 0 : 1); } catch { }
      try {
        // Try multiple method names across platforms/versions
        // @ts-ignore
        if (player.setRate) { // @ts-ignore
          await player.setRate(rate);
        }
        // @ts-ignore
        else if (player.setPlaybackRate) { // @ts-ignore
          await player.setPlaybackRate(rate);
        }
        // @ts-ignore
        else if (player.setSpeed) { // @ts-ignore
          await player.setSpeed(rate);
        }
        // @ts-ignore
        else if (player.setPlaybackSpeed) { // @ts-ignore
          await player.setPlaybackSpeed(rate);
        }
      } catch { }
      setIsPlaying(true);
      setIsLoading(false); // flip spinner off immediately after start
      setIsBuffering(false);
    } catch (err) {
      console.error('Failed to start playback', err);
    } finally {
      // keep no-op: isLoading already set false right after start
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- player is a stable singleton
  }, [url, isBuffering, progress, isMuted, rate]);

  const onPausePlay = useCallback(async () => {
    try {
      await player.pausePlayer();
      setIsPlaying(false);
    } catch (e) {
      console.error('pause failed', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- player is a stable singleton
  }, []);

  const onResumePlay = useCallback(async () => {
    try {
      await player.resumePlayer();
      setIsPlaying(true);
    } catch (e) {
      console.error('resume failed', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- player is a stable singleton
  }, []);

  const onSeek = useCallback(async (value: number) => {
    if (totalDuration > 0) {
      const seekTime = (value / 100) * totalDuration;
      try {
        await player.seekToPlayer(seekTime);
      } catch (e) {
        console.error('seek failed', e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- player is a stable singleton
  }, [totalDuration]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      onPausePlay();
      return;
    }
    if (progress.value > 0) {
      onResumePlay();
      return;
    }
    onStartPlay();
  }, [isPlaying, onPausePlay, onResumePlay, onStartPlay, progress.value]);

  const toggleMute = useCallback(async () => {
    const next = !isMuted;
    setIsMuted(next);
    try { await player.setVolume(next ? 0 : 1); } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- player is a stable singleton
  }, [isMuted]);

  const cycleRate = useCallback(async () => {
    const rates = [0.5, 1.0, 1.25, 1.5, 2.0];
    const i = rates.indexOf(rate);
    const next = rates[(i + 1) % rates.length];
    setRate(next);
    try {
      // @ts-ignore
      if (player.setRate) { // @ts-ignore
        await player.setRate(next);
      }
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- player is a stable singleton
  }, [rate]);

  useEffect(() => {
    return () => {
      player.stopPlayer().catch(() => { });
      player.removePlayBackListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- player is a stable singleton
  }, []);

  return (
    <View style={styles.pillContainer}>
      <TouchableOpacity style={styles.playButton} disabled={isLoading} onPress={handlePlayPause}>
        {isLoading || isBuffering ? (
          <LoadingIconAsset width={16} height={16} fill="#111827" />
        ) : isPlaying ? (
          <PauseIcon />
        ) : (
          <PlayIcon />
        )}
      </TouchableOpacity>

      <View style={styles.progressArea}>
        <Slider
          style={styles.slider}
          progress={progress}
          minimumValue={min}
          maximumValue={max}
          thumbWidth={12}
          onSlidingComplete={onSeek}
          theme={{ maximumTrackTintColor: '#ddd', minimumTrackTintColor: '#111', cacheTrackTintColor: '#D1D5DB' }}
        />
      </View>

      {/* volume toggle */}
      <TouchableOpacity style={styles.smallButton} onPress={toggleMute} disabled={isLoading}>
        {isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
      </TouchableOpacity>

      {/* rate toggle */}
      <TouchableOpacity style={styles.smallButton} onPress={cycleRate} disabled={isLoading}>
        <Text style={styles.smallText}>{`${rate}x`}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 25,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressArea: {
    flex: 1,
    minWidth: 80,
  },
  slider: {
    width: '100%',
    height: 16,
  },
  smallButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  smallText: {
    fontSize: 12,
    color: '#666',
  },
});
