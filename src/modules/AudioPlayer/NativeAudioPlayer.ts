import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

// Simple Turbo Module interface with just one method for testing
export interface Spec extends TurboModule {
  // Simple method: JS calls this, native executes and returns a promise with string
  getGreetingFromNative(name: string): Promise<string>;
}

export default TurboModuleRegistry.get<Spec>('AudioPlayer');
