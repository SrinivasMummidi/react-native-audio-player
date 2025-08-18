// Environment types
export type AppEnv =
  | 'dev-preview'
  | 'development'
  | 'staging'
  | 'beta'
  | 'live';

// Transcript related types
export interface Word {
  text: string;
  start: number;
  end: number;
  type: 'word' | 'spacing';
  speaker_id: string;
  speakerId: string;
  logprob: number;
  characters: null;
}

export interface TranscriptData {
  language_code: string;
  language_probability: number;
  text: string;
  words: Word[];
  additional_formats: null;
  segments?: TranscriptSegment[];
}

export interface SpeakerLabel {
  name: string;
  type: string;
}

export interface SpeakerLabels {
  [key: string]: SpeakerLabel;
}

export interface Summary {
  text: string;
}

export interface TranscriptSegment {
  speaker_id: string;
  words: Word[];
}

export interface MockResponseData {
  data: {
    connectionId: string;
    transcript: {
      data: TranscriptData;
      speakerLabels: SpeakerLabels;
    };
    summary: Summary;
  };
}

// Search related types
export interface SearchMatch {
  segmentIndex: number;
  wordIndex: number;
  start: number; // Character start position in word text
  end: number; // Character end position in word text
}

export interface SearchState {
  searchTerm: string;
  matches: SearchMatch[];
  currentMatchIndex: number;
  isSearching: boolean;
}

export interface SearchContextType {
  // State
  searchState: SearchState;

  // Actions
  search: (term: string) => void;
  clearSearch: () => void;
  nextMatch: () => void;
  previousMatch: () => void;
  jumpToMatch: (index: number) => void;
}

export interface SearchableWord {
  text: string;
  segmentIndex: number;
  wordIndex: number;
}

// Call Recording related types
export type CallRecordingParams = {
  connectionId: string;
  brandId?: string;
  getAccessToken: () => Promise<string>;
  uniquePin?: string;
  mode?: AppEnv;
  callRecApiKey?: string;
  messageSavedTime?: number;
};

export type CallRecordingResponse = {
  availableFor: number;
  data: string;
  expiryTime: number;
};

// Hook types
export interface UseTranscriptAudioReturn {
  currentTime: number;
  seek: (time: number) => void;
}
