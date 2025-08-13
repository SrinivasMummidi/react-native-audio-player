import type { MockResponseData } from '../types/types';

// Simple in-memory cache for insights by connectionId
const insightsCache = new Map<string, MockResponseData>();

async function fetchInsights({
  connectionId,
  getAccessToken,
}: {
  connectionId: string;
  getAccessToken: () => Promise<string>;
}): Promise<MockResponseData | undefined> {
  // Return cached result if present
  const cached = insightsCache.get(connectionId);
  if (cached) return cached;

  const accessToken = await getAccessToken();
  try {
    const result = await fetch(
      `https://backend.switchport.app/api/v1/call/insights/${connectionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ components: ['transcript', 'summary'] }),
      },
    );

    if (!result.ok) {
      throw new Error(
        `Error fetching insights: ${result.statusText} (${result.status})`,
      );
    }

    const data = await result.json();
    insightsCache.set(connectionId, data);
    return data;
  } catch (error) {
    console.error('Error fetching insights:', error);
    return undefined;
  }
}

export { fetchInsights };
