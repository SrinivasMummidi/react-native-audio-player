# React Native Audio Player

A comprehensive React Native audio player built with `react-native-audio-recorder-player` and `react-native-awesome-slider`, inspired by the Phonesystem web audio player.

## Features

### Core Audio Features
- ✅ Audio playback with play/pause/stop controls
- ✅ Seeking with interactive slider control
- ✅ Skip forward/backward (10 seconds)
- ✅ Volume control (0-100%)
- ✅ Playback speed control (0.5x to 2.0x)
- ✅ Real-time progress tracking
- ✅ Duration and current time display

### Recording Features
- ✅ Audio recording with high-quality settings
- ✅ Recording pause/resume functionality
- ✅ Real-time recording time display
- ✅ Automatic permission handling for Android/iOS

### Architecture
- ✅ Three different implementation approaches:
  - **SimpleAudioPlayer**: Basic playback-only component
  - **AudioPlayer**: Full-featured standalone component
  - **ContextAudioPlayer**: Context-based state management (recommended)

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

### Simple Audio Player (Playback Only)

```tsx
import { SimpleAudioPlayer } from './src/components/AudioPlayer';

function MyComponent() {
  return (
    <SimpleAudioPlayer 
      audioUrl="https://example.com/audio.mp3"
      autoPlay={false}
    />
  );
}
```

### Full Audio Player (Playback + Recording)

```tsx
import { AudioPlayer } from './src/components/AudioPlayer';

function MyComponent() {
  const handleRecordingComplete = (filePath: string) => {
    console.log('Recording saved to:', filePath);
  };

  return (
    <AudioPlayer
      audioUrl="https://example.com/audio.mp3"
      onRecordingComplete={handleRecordingComplete}
      showRecording={true}
    />
  );
}
```

### Context-Based Audio Player (Recommended)

```tsx
import { AudioPlayerProvider, ContextAudioPlayer, useAudioPlayer } from './src/components/AudioPlayer';

function AudioPlayerWrapper() {
  const { setAudioUrl } = useAudioPlayer();
  
  React.useEffect(() => {
    setAudioUrl('https://example.com/audio.mp3');
  }, []);

  return <ContextAudioPlayer showRecording={true} />;
}

function App() {
  return (
    <AudioPlayerProvider
      onRecordingComplete={(filePath) => console.log('Recorded:', filePath)}
      onError={(error) => console.error('Error:', error)}
    >
      <AudioPlayerWrapper />
    </AudioPlayerProvider>
  );
}
```

## API Reference

### SimpleAudioPlayer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `audioUrl` | `string` | `undefined` | URL of the audio file to play |
| `autoPlay` | `boolean` | `false` | Whether to start playing automatically |

### AudioPlayer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `audioUrl` | `string` | `undefined` | URL of the audio file to play |
| `onRecordingComplete` | `(filePath: string) => void` | `undefined` | Callback when recording is completed |
| `showRecording` | `boolean` | `true` | Whether to show recording controls |

### AudioPlayerProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Child components |
| `onRecordingComplete` | `(filePath: string) => void` | `undefined` | Callback when recording is completed |
| `onError` | `(error: string) => void` | `undefined` | Error callback |

### AudioPlayerContext Methods

```tsx
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
} = useAudioPlayer();
```

## Supported Audio Formats

- **iOS**: MP3, AAC, WAV, M4A, AIFF, CAF
- **Android**: MP3, AAC, WAV, OGG, FLAC, AMR
- **Recording**: AAC format (high quality)

## Permissions

The components automatically handle permission requests on Android. For iOS, ensure you've added the microphone usage description to your Info.plist.

## Comparison with Web Version

This React Native implementation closely mirrors the functionality of the Phonesystem web audio player:

| Feature | Web Version | React Native Version |
|---------|-------------|---------------------|
| Audio Playback | ✅ HTML5 Audio | ✅ react-native-audio-recorder-player |
| Progress Slider | ✅ Custom slider | ✅ react-native-awesome-slider |
| Volume Control | ✅ Web API | ✅ Native volume control |
| Speed Control | ✅ Web API | ✅ Native speed control |
| Recording | ✅ MediaRecorder API | ✅ Native recording |
| Context State Management | ✅ React Context | ✅ React Context |
| Time Formatting | ✅ Custom utils | ✅ Custom utils |
| Permission Handling | ✅ Web permissions | ✅ Native permissions |

## Troubleshooting

### Common Issues

1. **Audio not playing on iOS Simulator**: Test on a real device, as audio features may not work properly on the simulator.

2. **Permission denied on Android**: Ensure all required permissions are added to AndroidManifest.xml and the app targets the correct SDK version.

3. **Build errors after installation**: 
   ```bash
   cd ios && pod install
   npx react-native clean
   npx react-native run-ios
   ```

4. **Reanimated issues**: Make sure you're using compatible versions of react-native-reanimated and react-native-gesture-handler.

### Performance Tips

- Use the Context-based player for complex apps with multiple audio components
- Dispose of audio resources properly by calling stop methods when components unmount
- Consider implementing audio caching for frequently played files

## License

This implementation follows the same architectural patterns as the original Phonesystem audio player and is built using MIT-licensed packages.

## Dependencies

- [react-native-audio-recorder-player](https://github.com/hyochan/react-native-audio-recorder-player) - Audio recording and playback
- [react-native-awesome-slider](https://github.com/alantoa/react-native-awesome-slider) - Interactive sliders
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) - Smooth animations
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) - Touch handling
