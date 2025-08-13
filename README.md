# React Native Audio Player

A clean, single audio player for React Native built on `react-native-audio-recorder-player` and `react-native-awesome-slider`.

This repository was simplified to one canonical implementation named AudioPlayer. Legacy variants (SimpleAudioPlayer, ContextAudioPlayer, EnhancedAudioPlayer) and recording code were removed.

See MIGRATION.md for upgrade notes from older versions within this repo.

## Features

### Playback

- ✅ Play/pause/stop controls
- ✅ Seek with an interactive slider
- ✅ Playback speed control (0.5x–2.0x)
- ✅ Real-time progress with remaining time option
- ✅ Volume/mute support at the provider level

### Architecture

- ✅ Context-based state management with AudioPlayerProvider
- ✅ Composable UI pieces (PlayButton, AudioTrack, PlaybackSpeedSelector)

## Installation

### 1. Install Dependencies

```bash
npm install react-native-audio-recorder-player react-native-nitro-modules react-native-awesome-slider react-native-reanimated react-native-gesture-handler
```

### 2. iOS Setup

```bash
cd ios && pod install
```

Add microphone permission to `ios/YourApp/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to your microphone to record audio.</string>
```

### 3. Android Setup

Add permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## Usage

There are two common ways to use the player: a simple drop-in component, or composing your own UI with the context.

### 1) Drop-in player

```tsx
import { AudioPlayer } from './src/components/AudioPlayer';

export function MyScreen() {
  return (
    <AudioPlayer
      audioUrl="https://example.com/audio.mp3"
      // optional UI tweaks
      showPlaybackSpeed
      showTotalTime
    />
  );
}
```

### 2) Compose with context

```tsx
import {
  AudioPlayerProvider,
  AudioPlayerContent,
  useAudioPlayer,
} from './src/components/AudioPlayer';

export function MyScreen() {
  const [url, setUrl] = React.useState<string | undefined>();

  React.useEffect(() => {
    setUrl('https://example.com/audio.mp3');
  }, []);

  return (
    <AudioPlayerProvider defaultAudioUrl={url}>
      <AudioPlayerContent showPlaybackSpeed showTotalTime />
    </AudioPlayerProvider>
  );
}
```

## API Reference

### AudioPlayer Props

| Prop       | Type                      | Default     | Description                                                           |
| ---------- | ------------------------- | ----------- | --------------------------------------------------------------------- |
| `audioUrl` | `string`                  | `undefined` | URL of the audio file to play                                         |
| `onError`  | `(error: string) => void` | `undefined` | Error callback when playback fails                                    |
| UI props   | Various                   | See source  | Styling and visibility flags (e.g., showPlaybackSpeed, showTotalTime) |

### AudioPlayerProvider Props

| Prop              | Type                      | Default     | Description                        |
| ----------------- | ------------------------- | ----------- | ---------------------------------- |
| `children`        | `ReactNode`               | -           | Child components                   |
| `defaultAudioUrl` | `string`                  | `undefined` | Initial URL to load                |
| `onError`         | `(error: string) => void` | `undefined` | Error callback when playback fails |

### useAudioPlayer

```tsx
const {
  // Playback state
  isPlaying,
  isLoading,
  isBuffering,
  currentPosition,
  totalDuration,
  audioUrl,

  // Audio settings
  volume,
  isMuted,
  playbackSpeed,

  // Actions
  setAudioUrl,
  play,
  pause,
  stop,
  seekTo,
  toggleMute,
  cyclePlaybackSpeed,
} = useAudioPlayer();
```

## Supported Audio Formats

- iOS: MP3, AAC, WAV, M4A, AIFF, CAF
- Android: MP3, AAC, WAV, OGG, FLAC, AMR

## Permissions

The components automatically handle permission requests on Android. For iOS, ensure you've added the microphone usage description to your Info.plist.

## Comparison with Web Version

This React Native implementation mirrors the Phonesystem web audio player for playback UX:

| Feature         | Web Version      | React Native Version                  |
| --------------- | ---------------- | ------------------------------------- |
| Audio Playback  | ✅ HTML5 Audio   | ✅ react-native-audio-recorder-player |
| Progress Slider | ✅ Custom slider | ✅ react-native-awesome-slider        |
| Volume Control  | ✅ Web API       | ✅ Native volume control              |
| Speed Control   | ✅ Web API       | ✅ Native speed control               |
| Context State   | ✅ React Context | ✅ React Context                      |

## Troubleshooting

### Common Issues

1. Audio not playing on iOS Simulator: Prefer a real device; simulators can be limited for audio.
2. Permission denied on Android: Ensure required permissions are added to AndroidManifest.xml.
3. Reanimated issues: Use compatible versions of react-native-reanimated and react-native-gesture-handler.

### Performance Tips

- Use the Context-based player for complex apps with multiple audio components
- Dispose of audio resources properly by calling stop methods when components unmount
- Consider implementing audio caching for frequently played files

## SVG Icons

This project uses react-native-svg with react-native-svg-transformer so you can import SVGs as components from `src/assets/icons`:

```tsx
import PlayIcon from './src/assets/icons/media-control-play-filled.svg';

export function IconExample() {
  return <PlayIcon width={16} height={16} fill="#111827" />;
}
```

Configuration:

- Metro: `metro.config.js` sets `babelTransformerPath` and adjusts `assetExts`/`sourceExts`.
- TypeScript: `src/types/svg.d.ts` declares `.svg` modules.
- Jest: `jest.config.js` maps `.svg` to `__mocks__/svgMock.js`.

## License

MIT

## Dependencies

- [react-native-audio-recorder-player](https://github.com/hyochan/react-native-audio-recorder-player) – Audio playback
- [react-native-awesome-slider](https://github.com/alantoa/react-native-awesome-slider) – Interactive slider
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) – Animations
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) – Touch handling
