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
