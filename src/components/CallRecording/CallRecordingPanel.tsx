/**
 * CallRecordingPanel component for displaying transcript and summary data
 * Integrates with Phonesystem's insights API for real-time transcript display
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useAudioPlayer } from '../AudioPlayer/AudioPlayerContext';
import {
  fetchInsightsNative,
  type InsightsResponse,
  type TranscriptSegment,
  type SpeakerLabels,
  formatSpeakerLabel,
} from '../../services/insights';

interface CallRecordingPanelProps {
  connectionId?: string;
  getAccessToken?: () => Promise<string>;
  insightsBaseUrl?: string;
  onSummarise?: () => Promise<InsightsResponse | void> | void;
  isVisible?: boolean;
  autoFetchOnShow?: boolean;
}

export const CallRecordingPanel: React.FC<CallRecordingPanelProps> = ({
  onSummarise,
  connectionId,
  getAccessToken,
  insightsBaseUrl,
  isVisible = true,
  autoFetchOnShow = true,
}) => {
  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const [speakerLabels, setSpeakerLabels] = useState<SpeakerLabels | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Refs
  const transcriptRef = useRef<ScrollView>(null);
  const rowPositionsRef = useRef<number[]>([]);
  
  // Audio player context
  const { isPlaying, currentPosition } = useAudioPlayer();

  // Filtered segments based on search query
  const filteredSegments = useMemo(() => {
    if (!transcriptSegments.length) return [];
    
    const query = searchQuery.trim().toLowerCase();
    if (!query) return transcriptSegments;
    
    return transcriptSegments.filter(segment => {
      // Ensure segment has words array
      if (!segment.words || !Array.isArray(segment.words)) return false;
      
      const segmentText = segment.words.map(word => word.text).join(' ');
      const speakerLabel = formatSpeakerLabel(segment, speakerLabels || undefined);
      
      return segmentText.toLowerCase().includes(query) ||
             (segment.speaker || '').toLowerCase().includes(query) ||
             speakerLabel.toLowerCase().includes(query);
    });
  }, [transcriptSegments, searchQuery, speakerLabels]);

  // Find active segment based on current audio position
  const activeSegmentIndex = useMemo(() => {
    if (!filteredSegments.length || !currentPosition || !isPlaying) return -1;
    
    const currentTimeInSeconds = currentPosition / 1000;
    
    return filteredSegments.findIndex(segment => {
      // Ensure segment has words array
      if (!segment.words || !Array.isArray(segment.words) || !segment.words.length) return false;
      
      const firstWord = segment.words[0];
      const lastWord = segment.words[segment.words.length - 1];
      const startTime = firstWord.start ?? 0;
      const endTime = lastWord.end ?? Infinity;
      
      return currentTimeInSeconds >= startTime && currentTimeInSeconds < endTime;
    });
  }, [filteredSegments, currentPosition, isPlaying]);

  // Auto-scroll when the active segment changes
  useEffect(() => {
    if (activeTab !== 'transcript' || !autoScroll || !isPlaying) return;
    if (activeSegmentIndex < 0) return;
    
    const segmentPosition = rowPositionsRef.current[activeSegmentIndex];
    if (typeof segmentPosition === 'number') {
      const targetPosition = Math.max(0, segmentPosition - 120);
      transcriptRef.current?.scrollTo({ y: targetPosition, animated: true });
    }
  }, [activeSegmentIndex, activeTab, autoScroll, isPlaying]);

  const handleFetchInsights = useCallback(async () => {
    if (!connectionId || !getAccessToken || !insightsBaseUrl) {
      return;
    }

    try {
      setIsLoading(true);
      setHasInitialized(true);
      
      let response: InsightsResponse | undefined;
      
      if (onSummarise) {
        const result = await onSummarise();
        response = result as InsightsResponse | undefined;
      } else {
        response = await fetchInsightsNative({
          connectionId,
          getAccessToken,
          baseUrl: insightsBaseUrl,
        });
      }
      
      if (response) {
        setSummaryText(response.summary ?? null);
        setTranscriptSegments(response.transcript);
        setSpeakerLabels(response.speakerLabels ?? null);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch insights';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  }, [onSummarise, connectionId, getAccessToken, insightsBaseUrl]);

  // Auto-fetch insights when component becomes visible and no data exists
  useEffect(() => {
    if (
      isVisible && 
      autoFetchOnShow && 
      !hasInitialized && 
      !transcriptSegments.length
    ) {
      handleFetchInsights();
    }
  }, [
    isVisible, 
    autoFetchOnShow, 
    hasInitialized, 
    transcriptSegments.length, 
    handleFetchInsights
  ]);

  return isVisible ? (
    <View style={styles.sheet}>
      {/* Show tabs + content directly - no summarise button here */}
      <View style={styles.tabsRow}>
        <View style={styles.tabsLeft}>
          <TouchableOpacity onPress={() => setActiveTab('summary')}>
            <Text
              style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
            >
              Call summary
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('transcript')}>
            <Text
              style={[
                styles.tab,
                activeTab === 'transcript' && styles.activeTab,
              ]}
            >
              Transcript
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.langToggle}>
          <Text style={styles.langText}>EN</Text>
        </View>
      </View>

      {activeTab === 'transcript' && (
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity onPress={() => setAutoScroll(v => !v)}>
            <Text style={styles.toggleText}>
              {autoScroll ? 'Auto' : 'Manual'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        ref={transcriptRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#111827" />
          </View>
        ) : activeTab === 'summary' ? (
          <Text style={styles.paragraph}>
            {summaryText ?? 'No summary available'}
          </Text>
        ) : filteredSegments.length ? (
          filteredSegments.map((seg, idx) => {
            const speakerLabel = formatSpeakerLabel(seg, speakerLabels || undefined);
            const isActiveSegment = idx === activeSegmentIndex;
            
            return (
              <View
                key={idx}
                onLayout={e => {
                  rowPositionsRef.current[idx] = e.nativeEvent.layout.y;
                }}
                style={[
                  styles.transcriptSegment,
                  isActiveSegment ? styles.activeSegment : null,
                ]}
              >
                {seg.speaker && (
                  <Text style={styles.speakerLabel}>
                    {speakerLabel}
                  </Text>
                )}
                <Text style={[
                  styles.segmentText,
                  isActiveSegment ? styles.activeText : null,
                ]}>
                  {seg.words && Array.isArray(seg.words) 
                    ? seg.words.map(w => w?.text || '').join(' ')
                    : 'No content available'
                  }
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.muted}>
            {searchQuery ? 'No matches.' : 'No transcript available.'}
          </Text>
        )}
      </ScrollView>

      {/* Footer note */}
      <View style={styles.footerRow}>
        <View style={styles.footerIcons} />
        <Text style={styles.caption}>Voice-to-text generated.</Text>
      </View>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeBtn: {
    padding: 6,
  },
  playerRow: {
    paddingTop: 4,
  },
  playerContainerStretch: {
    alignSelf: 'stretch',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  tabsLeft: {
    flexDirection: 'row',
    gap: 16,
  },
  tab: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeTab: {
    color: '#111827',
    fontWeight: '600',
    textDecorationLine: 'underline',
    textDecorationColor: '#111827',
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langText: {
    fontSize: 12,
    color: '#111827',
  },
  content: {
    maxHeight: 420,
  },
  contentContainer: {
    paddingBottom: 16,
  },
  paragraph: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  speaker: {
    fontWeight: '700',
    marginTop: 8,
  },
  speakerHeader: {
    fontWeight: '700',
    marginTop: 10,
  },
  activeLine: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 4,
  },
  muted: {
    fontSize: 14,
    color: '#6B7280',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchIcon: {
    color: '#6B7280',
  },
  searchInput: {
    flex: 1,
    color: '#111827',
    padding: 0,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  footerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  caption: {
    fontSize: 12,
    color: '#6B7280',
  },
  toggleText: {
    color: '#111827',
  },
  toggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingWrap: {
    paddingVertical: 16,
  },
  transcriptSegment: {
    marginBottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  activeSegment: {
    backgroundColor: '#F3F4F6',
  },
  speakerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  segmentText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  activeText: {
    fontWeight: '500',
  },
});

export default CallRecordingPanel;
