import React, { useRef, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SpeakerLabels, TranscriptSegment } from '../../types/types';
import TranscriptSegmentComponent from './TranscriptSegment';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import { useAudioPlayer } from '../AudioPlayer/AudioPlayerContext';
import { SearchProvider, useSearch } from '../../context/SearchContext';
import { useAutoScroll } from '../../context/AutoScrollContext';
import SearchInput from '../Search/SearchInput';
import LoadingSpinner from '../common/LoadingSpinner';

interface TranscriptViewProps {
  speakerLabels: SpeakerLabels;
  onManualScroll?: () => void;
  segments: TranscriptSegment[];
}

const TranscriptViewContent: React.FC<TranscriptViewProps> = ({
  speakerLabels,
  onManualScroll,
  segments = [],
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const rowPositionsRef = useRef<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentTime, seek } = useCurrentTime();
  const { isPlaying } = useAudioPlayer();
  const { searchState } = useSearch();
  const { autoSync } = useAutoScroll();
  useEffect(() => {
    setIsLoading(false);
  }, []);
  // Find active segment based on current audio position
  const activeSegmentIndex = useMemo(() => {
    if (!segments.length || !currentTime) return -1;

    return segments.findIndex(segment => {
      if (!segment.words || !segment.words.length) return false;

      const firstWord = segment.words[0];
      const lastWord = segment.words[segment.words.length - 1];
      const startTime = firstWord.start ?? 0;
      const endTime = lastWord.end ?? Infinity;

      return currentTime >= startTime && currentTime < endTime;
    });
  }, [segments, currentTime]);

  useEffect(() => {
    if (!autoSync || !isPlaying) return;
    if (activeSegmentIndex < 0) return;

    const segmentPosition = rowPositionsRef.current[activeSegmentIndex];
    if (typeof segmentPosition === 'number') {
      const targetPosition = Math.max(0, segmentPosition - 120);
      scrollViewRef.current?.scrollTo({ y: targetPosition, animated: true });
    }
  }, [activeSegmentIndex, autoSync, isPlaying]);

  // Scroll to current search match
  useEffect(() => {
    if (searchState.currentMatchIndex >= 0 && searchState.matches.length > 0) {
      const currentMatch = searchState.matches[searchState.currentMatchIndex];
      const segmentPosition =
        rowPositionsRef.current[currentMatch.segmentIndex];

      if (typeof segmentPosition === 'number') {
        const targetPosition = Math.max(0, segmentPosition - 120);
        scrollViewRef.current?.scrollTo({ y: targetPosition, animated: true });
      }
    }
  }, [searchState.currentMatchIndex, searchState.matches]);

  if (!segments.length) {
    return (
      <View style={styles.container}>
        <SearchInput />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No transcript available</Text>
        </View>
      </View>
    );
  }
  return isLoading ? (
    <View style={[styles.contentContainer, styles.loadingSection]}>
      <LoadingSpinner size={24} />
    </View>
  ) : (
    <View style={styles.container}>
      <SearchInput />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        bounces={false}
        onScrollBeginDrag={onManualScroll}
        onTouchStart={onManualScroll}
      >
        {segments.map((segment, index) => {
          const isActiveSegment = index === activeSegmentIndex;
          return (
            <View
              key={`${segment.speaker_id}-${index}`}
              onLayout={e => {
                rowPositionsRef.current[index] = e.nativeEvent.layout.y;
              }}
            >
              <TranscriptSegmentComponent
                speakerId={segment.speaker_id}
                words={segment.words}
                speakerLabels={speakerLabels}
                currentTime={currentTime}
                segmentIndex={index}
                onWordPress={seek}
                isActiveSegment={isActiveSegment}
                isPlaying={isPlaying}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Main component that provides search context
const TranscriptView: React.FC<TranscriptViewProps> = props => {
  return (
    <SearchProvider transcriptSegments={props.segments}>
      <TranscriptViewContent {...props} />
    </SearchProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 8,
  },
  contentContainer: {
    paddingRight: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  loadingSection: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TranscriptView;
