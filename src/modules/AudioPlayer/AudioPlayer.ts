import NativeAudioPlayer from './NativeAudioPlayer';

/**
 * AudioPlayer Module wrapper for Turbo Module
 * This provides a clean interface to call the native module
 */
export class AudioPlayer {
  /**
   * Test method: Calls native iOS app and gets a greeting back
   * @param name - The name to send to native app
   * @returns Promise<string> - A greeting message from native app
   */
  static async getGreetingFromNative(name: string): Promise<string> {
    try {
      if (!NativeAudioPlayer) {
        throw new Error('AudioPlayer Turbo Module not available');
      }

      const result = await NativeAudioPlayer.getGreetingFromNative(name);
      return result;
    } catch (error) {
      console.error('❌ Error calling native AudioPlayer method:', error);
      throw error;
    }
  }
}

export default AudioPlayer;
