import {
  INBOUND_BASE_URLS_LIVE,
  INBOUND_BASE_URLS_STAGING,
} from '../lib/constants';
import {
  getEnvironment,
  isEnvironment,
  isProduction,
} from '../lib/environment';
import type { CallRecordingParams, CallRecordingResponse } from '../types/types';

export const fetchCallRecordingUrl = async ({
  connectionId,
  brandId,
  getAccessToken,
  uniquePin,
  mode,
  callRecApiKey,
  messageSavedTime,
}: CallRecordingParams): Promise<CallRecordingResponse> => {
  if (isProduction(mode) || getEnvironment(mode) === 'staging') {
    if (!brandId) throw new Error('Missing required parameter brandId');
    const accessToken = await getAccessToken();
    const baseURL = isProduction(mode)
      ? INBOUND_BASE_URLS_LIVE[brandId]
      : INBOUND_BASE_URLS_STAGING[brandId];
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
    return data as CallRecordingResponse;
  }

  if (
    isEnvironment(mode, 'development') ||
    isEnvironment(mode, 'dev-preview')
  ) {
    if (!callRecApiKey) throw new Error('Missing required param callRecApiKey');
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
    return {
      availableFor: data.availableFor as number,
      data: (data.data ?? data.signedURL) as string,
      expiryTime: (data.expiryTime as number) || Date.now() + 30 * 60 * 1000,
    };
  }

  return { availableFor: 0, data: '', expiryTime: 0 };
};
