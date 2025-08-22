import TrackPlayer, { Event, RepeatMode, State, Capability } from 'react-native-track-player';

// Basic playback service handling remote events & focus.
// Extend as needed (e.g., handling custom events, analytics, etc.).
export default async function () {
  // Ensure options reflect remote controls we respond to
  try {
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SeekTo,
        Capability.Stop,
      ],
      progressUpdateEventInterval: 2,
    });
  } catch {}

  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteSeek, (e) => {
    if (typeof e.position === 'number') {
      TrackPlayer.seekTo(e.position).catch(() => {});
    }
  });

  // Single-track app: ignore next/previous gracefully
  TrackPlayer.addEventListener(Event.RemoteNext, () => {});
  TrackPlayer.addEventListener(Event.RemotePrevious, () => {});

  try {
    await TrackPlayer.setRepeatMode(RepeatMode.Off);
  } catch {}

  TrackPlayer.addEventListener(Event.PlaybackState, async ({ state }) => {
    if (state === State.Ended) {
      // Auto reset position for subsequent play
      try {
        await TrackPlayer.seekTo(0);
        await TrackPlayer.pause();
      } catch {}
    }
  });
}
