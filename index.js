/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import TrackPlayer from 'react-native-track-player';
import trackPlayerService from './trackPlayerService';

AppRegistry.registerComponent('NativeApp', () => App);

// Register playback service for background & notification controls
try {
  TrackPlayer.registerPlaybackService(() => trackPlayerService);
} catch (e) {
  console.log('failed to link trackPlayerService', e);
}
