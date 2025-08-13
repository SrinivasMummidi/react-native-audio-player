import React, { useRef, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { SpeakerLabels, Word } from '../../types/transcript';
import TranscriptSegmentComponent from './TranscriptSegment';
import { formatTranscriptData } from '../../utils/transcriptUtils';
import { useTranscriptAudio } from '../../hooks/useTranscriptAudio';
import { useAudioPlayer } from '../AudioPlayer/AudioPlayerContext';

interface TranscriptViewProps {
    words: Word[];
    speakerLabels: SpeakerLabels;
}

const TranscriptView: React.FC<TranscriptViewProps> = ({
    words,
    speakerLabels,
}) => {
    const [autoScroll] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);
    const rowPositionsRef = useRef<number[]>([]);

    const { currentTime, seek } = useTranscriptAudio();
    const { isPlaying } = useAudioPlayer();
    const segments = useMemo(() => formatTranscriptData(words), [words]);

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

    // Auto-scroll when the active segment changes
    useEffect(() => {
        if (!autoScroll || !isPlaying) return;
        if (activeSegmentIndex < 0) return;

        const segmentPosition = rowPositionsRef.current[activeSegmentIndex];
        if (typeof segmentPosition === 'number') {
            const targetPosition = Math.max(0, segmentPosition - 120);
            scrollViewRef.current?.scrollTo({ y: targetPosition, animated: true });
        }
    }, [activeSegmentIndex, autoScroll, isPlaying]);

    if (!segments.length) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No transcript available</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                bounces={false}
            >
                {segments.map((segment, index) => {
                    const isActiveSegment = index === activeSegmentIndex;
                    return (
                        <View
                            key={`${segment.speaker_id}-${index}`}
                            onLayout={(e) => {
                                rowPositionsRef.current[index] = e.nativeEvent.layout.y;
                            }}
                        >
                            <TranscriptSegmentComponent
                                speakerId={segment.speaker_id}
                                words={segment.words}
                                speakerLabels={speakerLabels}
                                currentTime={currentTime}
                                onWordPress={seek}
                                isActiveSegment={isActiveSegment}
                            />
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
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
});

export default TranscriptView;
