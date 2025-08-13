/**
 * Insights API service for fetching transcript data and summaries
 * Aligned with Phonesystem's transcript processing patterns
 */

interface WordData {
  text: string;
  start?: number;
  end?: number;
  type?: string;
  speakerId?: string;
  speaker_id?: string; // Legacy field support
}

interface RawTranscriptData {
  words?: WordData[]; // Make optional to handle missing data
  [key: string]: any; // Allow additional properties
}

export interface TranscriptSegment {
  speaker?: string;
  words: WordData[];
}

export interface SpeakerLabels {
  [key: string]: {
    name: string;
    type: string;
  };
}

export interface InsightsResponse {
  summary?: string;
  transcript: TranscriptSegment[];
  speakerLabels?: SpeakerLabels;
}

interface ApiResponseData {
  summary?: {
    text?: string;
    [key: string]: any;
  };
  transcript?: {
    data?: RawTranscriptData | any; // More flexible type
    speakerLabels?: SpeakerLabels;
    [key: string]: any;
  };
  [key: string]: any; // Allow additional properties
}

interface ApiResponse {
  data?: ApiResponseData;
  [key: string]: any; // Allow additional top-level properties
}

/**
 * Formats speaker label for display
 * @param segment - Transcript segment with speaker information
 * @param speakerLabels - Optional speaker label mappings
 * @returns Formatted speaker label
 */
export function formatSpeakerLabel(
  segment: { speaker?: string },
  speakerLabels?: SpeakerLabels,
): string {
  if (!segment.speaker) {
    return 'Speaker';
  }

  // Generate fallback label from speaker ID
  const speakerNumber =
    Number.parseInt(segment.speaker.replace('speaker_', ''), 10) + 1;
  const fallbackLabel = `Speaker ${speakerNumber}`;

  // Use speaker labels if available
  if (speakerLabels?.[segment.speaker]) {
    const { name, type } = speakerLabels[segment.speaker];

    if (type === 'caller') {
      return name || 'Caller';
    }

    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  return fallbackLabel;
}

/**
 * Processes raw transcript data into structured segments
 * Based on Phonesystem's formatTranscript implementation
 * @param transcriptData - Raw transcript data from API
 * @returns Array of transcript segments grouped by speaker
 */
function formatTranscript(
  transcriptData: RawTranscriptData | null | undefined,
): TranscriptSegment[] {
  // Handle null, undefined, or missing words array
  if (!transcriptData) {
    return [];
  }

  if (!transcriptData.words || !Array.isArray(transcriptData.words)) {
    return [];
  }

  try {
    return transcriptData.words.reduce<TranscriptSegment[]>((acc, word) => {
      if (word.type === 'spacing') {
        return acc;
      }

      // Handle legacy speaker_id field - matching Phonesystem exactly
      const speakerId = word.speakerId || word.speaker_id;
      const previousSpeaker = acc[acc.length - 1]?.speaker;

      if (previousSpeaker === speakerId) {
        acc[acc.length - 1].words.push(word);
      } else {
        acc.push({ speaker: speakerId, words: [word] });
      }
      return acc;
    }, []);
  } catch (error) {
    console.error('Error processing transcript words:', error);
    return [];
  }
}

interface FetchInsightsParams {
  connectionId: string;
  getAccessToken: () => Promise<string>;
  baseUrl: string;
}

/**
 * Fetches insights data from the Phonesystem API
 * @param params - Configuration for API request
 * @returns Promise resolving to insights response
 * @throws Error if API request fails
 */
export async function fetchInsightsNative(
  params: FetchInsightsParams,
): Promise<InsightsResponse> {
  const { connectionId, getAccessToken, baseUrl } = params;

  try {
    const token = await getAccessToken();

    const response = await fetch(`${baseUrl}/${connectionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        components: ['transcript', 'summary'],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Insights API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data: ApiResponse = await response.json();

    // Extract and process response data with multiple fallback paths
    const summary = data.data?.summary?.text;

    // Try multiple possible paths for transcript data
    let transcriptData = null;
    const possiblePaths = [
      data.data?.transcript?.data,
      data.data?.transcript,
      data.transcript?.data,
      data.transcript,
      data.data?.transcription?.data,
      data.data?.transcription,
    ];

    for (const path of possiblePaths) {
      if (path && (path.words || Array.isArray(path))) {
        transcriptData = path;
        break;
      }
    }

    // If transcript data is an array directly, wrap it
    if (Array.isArray(transcriptData)) {
      transcriptData = { words: transcriptData };
    }

    const transcript = formatTranscript(transcriptData);

    // Try multiple paths for speaker labels
    const speakerLabels =
      data.data?.transcript?.speakerLabels ||
      data.data?.speakerLabels ||
      data.transcript?.speakerLabels ||
      data.speakerLabels;

    return {
      summary,
      transcript,
      speakerLabels,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch insights: ${error.message}`);
    }
    throw new Error('Failed to fetch insights: Unknown error');
  }
}
