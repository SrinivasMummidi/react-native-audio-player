import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MockResponseData } from '../types/types';

const CACHE_PREFIX = 'insights_cache_';
const CACHE_INDEX_KEY = 'insights_cache_index';
const MAX_CACHE_SIZE = 5;

async function cleanupOldEntries() {
  const indexData = await AsyncStorage.getItem(CACHE_INDEX_KEY);
  if (!indexData) return;

  const cacheIndex: Record<string, number> = JSON.parse(indexData);
  const entries = Object.entries(cacheIndex);

  if (entries.length > MAX_CACHE_SIZE) {
    const toRemove = entries
      .sort(([, a], [, b]) => b - a)
      .slice(MAX_CACHE_SIZE);

    for (const [id] of toRemove) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${id}`);
      delete cacheIndex[id];
    }

    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(cacheIndex));
  }
}

async function saveToCacheWithLimit(
  connectionId: string,
  data: MockResponseData,
) {
  const cacheKey = `${CACHE_PREFIX}${connectionId}`;
  const timestamp = Date.now();

  // Update index
  const indexData = await AsyncStorage.getItem(CACHE_INDEX_KEY);
  const cacheIndex: Record<string, number> = indexData
    ? JSON.parse(indexData)
    : {};
  cacheIndex[connectionId] = timestamp;

  // Save data and index
  await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
  await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(cacheIndex));

  setTimeout(() => cleanupOldEntries().catch(console.warn), 0);
}

async function fetchInsights({
  connectionId,
  getAccessToken,
}: {
  connectionId: string;
  getAccessToken: () => Promise<string>;
}): Promise<MockResponseData> {
  // Return cached result if present
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${connectionId}`);
    console.log('Cached insights:', cached);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    console.warn('Error reading from cache:', error);
  }

  const accessToken = await getAccessToken();
  try {
    const result = await fetch(
      `https://backend.switchport.app/api/v1/call/insights/${connectionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}testtttttt`,
        },
        body: JSON.stringify({ components: ['transcript', 'summary'] }),
      },
    );

    if (!result.ok) {
      const errorBody = await result.text().catch(() => 'Unknown error');
      throw new Error(
        `Error fetching insights: ${result.status} ${result.statusText}${errorBody ? ` - ${errorBody}` : ''}`,
      );
    }

    const data = await result.json();
    try {
      await saveToCacheWithLimit(connectionId, data);
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }
    return data;
  } catch (error) {
    console.error('Error fetching insights:', error);
    
    // Enhanced error handling with more details
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to insights service. Please check your internet connection.');
    } else if (error instanceof Error) {
      throw error; // Re-throw the original error with its details
    } else {
      throw new Error('Failed to fetch insights: Unknown error occurred');
    }
  }
}

export { fetchInsights };
