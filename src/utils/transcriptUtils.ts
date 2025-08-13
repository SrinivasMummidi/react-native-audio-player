import { Word, TranscriptSegment } from '../types/types';

export const formatTranscriptData = (words: Word[]): TranscriptSegment[] => {
  const segments: TranscriptSegment[] = [];
  let currentSpeaker = '';
  let currentWords: Word[] = [];

  words.forEach(word => {
    if (word.type === 'word') {
      const speakerId = word.speaker_id || word.speakerId;
      if (speakerId !== currentSpeaker) {
        // Save previous segment if exists
        if (currentWords.length > 0 && currentSpeaker) {
          segments.push({
            speaker_id: currentSpeaker,
            words: currentWords,
          });
        }
        // Start new segment
        currentSpeaker = speakerId;
        currentWords = [word];
      } else {
        currentWords.push(word);
      }
    }
  });

  // Add the last segment
  if (currentWords.length > 0 && currentSpeaker) {
    segments.push({
      speaker_id: currentSpeaker,
      words: currentWords,
    });
  }

  return segments;
};

export const getSpeakerName = (speakerId: string, speakerLabels: any) => {
  const speaker = speakerLabels[speakerId];
  if (!speaker) return speakerId;

  if (speaker.name) {
    return speaker.name;
  }

  // Capitalize the type for display
  return speaker.type.charAt(0).toUpperCase() + speaker.type.slice(1);
};

export const getCurrentWordIndex = (
  currentTime: number,
  words: Word[],
): number => {
  for (let i = 0; i < words.length; i++) {
    if (currentTime >= words[i].start && currentTime <= words[i].end) {
      return i;
    }
  }

  // If no exact match, find the closest word that has passed
  for (let i = words.length - 1; i >= 0; i--) {
    if (currentTime >= words[i].start) {
      return i;
    }
  }

  return -1;
};
