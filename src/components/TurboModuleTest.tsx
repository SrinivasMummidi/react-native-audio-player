import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { AudioPlayer } from '../modules/AudioPlayer';

export const TurboModuleTest: React.FC = () => {
  const [name, setName] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testNativeCall = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Calling native method with name:', name);
      const greeting = await AudioPlayer.getGreetingFromNative(name);
      console.log('✅ Received from native:', greeting);
      setResult(greeting);
    } catch (error) {
      console.error('❌ Error calling native method:', error);
      Alert.alert('Error', `Failed to call native method: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Turbo Module Test</Text>

      <Text style={styles.label}>Enter your name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name here..."
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={testNativeCall}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Calling Native...' : 'Get Greeting from Native'}
        </Text>
      </TouchableOpacity>

      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Result from Native:</Text>
          <Text style={styles.result}>{result}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  result: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
