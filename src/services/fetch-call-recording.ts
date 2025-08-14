import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  INBOUND_BASE_URLS_LIVE,
  INBOUND_BASE_URLS_STAGING,
} from '../lib/constants';
import {
  getEnvironment,
  isEnvironment,
  isProduction,
} from '../lib/environment';
import type {
  CallRecordingParams,
  CallRecordingResponse,
} from '../types/types';

const RECORDING_CACHE_PREFIX = 'recording_cache_';
const RECORDING_CACHE_INDEX_KEY = 'recording_cache_index';
const MAX_RECORDING_CACHE_SIZE = 10;

type CachedRecording = {
  data: CallRecordingResponse;
  cachedAt: number;
};

async function cleanupExpiredRecordings() {
  const indexData = await AsyncStorage.getItem(RECORDING_CACHE_INDEX_KEY);
  if (!indexData) return;

  const cacheIndex: Record<string, number> = JSON.parse(indexData);
  const now = Date.now();
  const validEntries: Record<string, number> = {};

  for (const [connectionId, cachedAt] of Object.entries(cacheIndex)) {
    const cached = await AsyncStorage.getItem(
      `${RECORDING_CACHE_PREFIX}${connectionId}`,
    );
    if (cached) {
      const { data }: CachedRecording = JSON.parse(cached);
      if (data.expiryTime > now) {
        validEntries[connectionId] = cachedAt;
      } else {
        await AsyncStorage.removeItem(
          `${RECORDING_CACHE_PREFIX}${connectionId}`,
        );
      }
    }
  }

  // Remove old entries if still over limit
  const entries = Object.entries(validEntries);
  if (entries.length > MAX_RECORDING_CACHE_SIZE) {
    const toRemove = entries
      .sort(([, a], [, b]) => b - a)
      .slice(MAX_RECORDING_CACHE_SIZE);

    for (const [id] of toRemove) {
      await AsyncStorage.removeItem(`${RECORDING_CACHE_PREFIX}${id}`);
      delete validEntries[id];
    }
  }

  await AsyncStorage.setItem(
    RECORDING_CACHE_INDEX_KEY,
    JSON.stringify(validEntries),
  );
}

async function saveToCacheWithExpiry(
  connectionId: string,
  data: CallRecordingResponse,
) {
  const cacheKey = `${RECORDING_CACHE_PREFIX}${connectionId}`;
  const cachedAt = Date.now();

  const indexData = await AsyncStorage.getItem(RECORDING_CACHE_INDEX_KEY);
  const cacheIndex: Record<string, number> = indexData
    ? JSON.parse(indexData)
    : {};
  cacheIndex[connectionId] = cachedAt;

  const cachedRecording: CachedRecording = { data, cachedAt };

  await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedRecording));
  await AsyncStorage.setItem(
    RECORDING_CACHE_INDEX_KEY,
    JSON.stringify(cacheIndex),
  );

  setTimeout(() => cleanupExpiredRecordings().catch(console.warn), 0);
}

export const fetchCallRecordingUrl = async ({
  connectionId,
  brandId,
  getAccessToken,
  uniquePin,
  mode,
  callRecApiKey,
  messageSavedTime,
}: CallRecordingParams): Promise<CallRecordingResponse> => {
  // Check cache first
  try {
    const cached = await AsyncStorage.getItem(
      `${RECORDING_CACHE_PREFIX}${connectionId}`,
    );
    if (cached) {
      const { data }: CachedRecording = JSON.parse(cached);
      if (data.expiryTime > Date.now()) {
        console.log('Returning cached recording:', data, Date.now());
        return data;
      }
      // Remove expired entry
      await AsyncStorage.removeItem(`${RECORDING_CACHE_PREFIX}${connectionId}`);
    }
  } catch (error) {
    console.warn('Error reading from recording cache:', error);
  }
  if (isProduction(mode) || getEnvironment(mode) === 'staging') {
    if (!brandId) throw new Error('Missing required parameter brandId');
    const accessToken = await getAccessToken();
    const baseURL = isProduction(mode)
      ? INBOUND_BASE_URLS_LIVE[brandId]
      : INBOUND_BASE_URLS_STAGING[brandId];
    // inbox team url
    const url = `${baseURL}/v3/services/aws/getCallRecording/connectionId/${connectionId}?uniquePin=${
      uniquePin ?? ''
    }&messageSavedTime=${messageSavedTime ?? ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok)
      throw new Error(
        `Error fetching call recording URL: ${response.statusText}`,
      );
    const data = await response.json();
    const result = data as CallRecordingResponse;

    try {
      await saveToCacheWithExpiry(connectionId, result);
    } catch (error) {
      console.warn('Error saving recording to cache:', error);
    }

    return result;
  }

  if (
    isEnvironment(mode, 'development') ||
    isEnvironment(mode, 'dev-preview')
  ) {
    if (!callRecApiKey) throw new Error('Missing required param callRecApiKey');
    // phone system url
    const response = await fetch(
      'https://oa706f8gc6.execute-api.us-east-1.amazonaws.com/prod/getrecording',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': callRecApiKey,
        },
        body: JSON.stringify({ contactId: connectionId }),
      },
    );
    const data = await response.json();
    const result = {
      availableFor: data.availableFor as number,
      data: (data.data ?? data.signedURL) as string,
      expiryTime: (data.expiryTime as number) || Date.now() + 30 * 60 * 1000,
    };

    try {
      await saveToCacheWithExpiry(connectionId, result);
    } catch (error) {
      console.warn('Error saving recording to cache:', error);
    }

    return result;
  }

  return { availableFor: 0, data: '', expiryTime: 0 };
};
