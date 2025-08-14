import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Word, SpeakerLabels } from '../../types/types';
import HighlightableText from '../Search/HighlightableText';

interface WordComponentProps {
  word: Word;
  shouldHighlight: boolean;
  onPress: () => void;
  segmentIndex: number;
  wordIndex: number;
}

const WordComponent: React.FC<WordComponentProps> = ({
  word,
  shouldHighlight,
  onPress,
  segmentIndex,
  wordIndex,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <HighlightableText
        text={word.text}
        segmentIndex={segmentIndex}
        wordIndex={wordIndex}
        style={[styles.word, shouldHighlight && styles.pastWord]}
        onPress={onPress}
      />
    </TouchableOpacity>
  );
};

interface TranscriptSegmentProps {
  speakerId: string;
  words: Word[];
  speakerLabels: SpeakerLabels;
  currentTime: number;
  segmentIndex: number;
  onWordPress: (time: number) => void;
  isActiveSegment?: boolean;
  isPlaying: boolean;
}

const formatSpeakerLabel = (
  speakerId: string,
  speakerLabels: SpeakerLabels,
) => {
  // Parse speaker number from ID (e.g., "speaker_0" -> "SPEAKER 1")
  const speakerNumber = parseInt(speakerId.replace('speaker_', ''), 10) + 1;
  let label = `SPEAKER ${speakerNumber}`;

  const speaker = speakerLabels[speakerId];
  if (speaker) {
    if (speaker.type === 'caller') {
      label = speaker.name || speaker.type;
    } else {
      label = speaker.type;
    }
  }

  return label.charAt(0).toUpperCase() + label.slice(1);
};

const TranscriptSegment: React.FC<TranscriptSegmentProps> = ({
  speakerId,
  words,
  speakerLabels,
  currentTime,
  segmentIndex,
  onWordPress,
  isPlaying,
}) => {
  const speakerName = formatSpeakerLabel(speakerId, speakerLabels);
  return (
    <View style={styles.segmentContainer}>
      <View style={styles.speakerHeader}>
        <Text style={styles.speakerName}>{speakerName}</Text>
      </View>
      <View style={styles.wordsContainer}>
        {words.map((word, index) => {
          const shouldHighlight =
            currentTime >= word.start || (!isPlaying && currentTime === 0);
          return (
            <WordComponent
              key={`${speakerId}-${index}`}
              word={word}
              shouldHighlight={shouldHighlight}
              segmentIndex={segmentIndex}
              wordIndex={index}
              onPress={() => {
                onWordPress(word.start);
              }}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  segmentContainer: {
    marginBottom: 12,
  },
  speakerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  speakerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  word: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 20,
    color: '#9c9c9c', // Light grey for future words
    marginRight: 2,
  },
  pastWord: {
    color: '#000000', // Black for past words
  },
  activeWord: {
    color: '#000000', // Black for active word
    fontWeight: 'bold', // Bold for active word
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 3,
  },
});

export default TranscriptSegment;
