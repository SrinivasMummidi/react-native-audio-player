import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  processEvents(event: string): Promise<string>;
}

export default TurboModuleRegistry.get<Spec>('NativeCommunication');
