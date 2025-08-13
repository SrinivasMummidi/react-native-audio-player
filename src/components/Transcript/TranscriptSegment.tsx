import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Word, SpeakerLabels } from '../../types/transcript';

interface WordComponentProps {
  word: Word;
  shouldHighlight: boolean;
  onPress: () => void;
}

const WordComponent: React.FC<WordComponentProps> = ({
  word,
  shouldHighlight,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.word, shouldHighlight && styles.pastWord]}>
        {word.text}
      </Text>
    </TouchableOpacity>
  );
};

interface TranscriptSegmentProps {
  speakerId: string;
  words: Word[];
  speakerLabels: SpeakerLabels;
  currentTime: number;
  onWordPress: (time: number) => void;
  isActiveSegment?: boolean;
}

const TranscriptSegment: React.FC<TranscriptSegmentProps> = ({
  speakerId,
  words,
  speakerLabels,
  currentTime,
  onWordPress,
}) => {
  const speaker = speakerLabels[speakerId];
  const speakerName = speaker?.name || speaker?.type || speakerId;
  return (
    <View style={styles.segmentContainer}>
      <View style={styles.speakerHeader}>
        <Text style={styles.speakerName}>
          {speakerName.charAt(0).toUpperCase() + speakerName.slice(1)}
        </Text>
      </View>
      <View style={styles.wordsContainer}>
        {words.map((word, index) => {
          const shouldHighlight = currentTime >= word.start;
          return (
            <WordComponent
              key={`${speakerId}-${index}`}
              word={word}
              shouldHighlight={shouldHighlight}
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
    marginBottom: 16,
  },
  activeSegmentContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
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
    lineHeight: 24,
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
