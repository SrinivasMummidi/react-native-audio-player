import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  processEvents(event: string): Promise<string>;
  readonly onCommunicationEvent: EventEmitter<{ type: string; data?: string }>;
}

export default TurboModuleRegistry.get<Spec>('NativeCommunication');
