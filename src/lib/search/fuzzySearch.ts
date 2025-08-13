import Fuse, { FuseResult } from 'fuse.js';
import { TranscriptSegment, SearchableWord } from '../../types/types';

/**
 * Creates a Fuse.js search matcher for transcript segments
 * Similar to audio-transcript-player implementation
 */
export function createTranscriptMatcher(segments: TranscriptSegment[]): (searchQuery: string) => FuseResult<SearchableWord>[] {
  // Flatten all words from all segments for search
  const searchableWords: SearchableWord[] = [];
  
  segments.forEach((segment, segmentIndex) => {
    segment.words.forEach((word, wordIndex) => {
      if (word.type === 'word') {
        searchableWords.push({
          text: word.text,
          segmentIndex,
          wordIndex,
        });
      }
    });
  });

  const fuse = new Fuse(searchableWords, {
    minMatchCharLength: 2,
    keys: ['text'],
    isCaseSensitive: false,
    includeMatches: true,
    sortFn: (a, b) => a.idx - b.idx,
    threshold: 0.3, // Slightly more permissive than web version
  });

  return function matcher(searchQuery: string): FuseResult<SearchableWord>[] {
    if (!searchQuery.trim()) {
      return [];
    }

    // Split search query into keywords and filter unique terms
    const keywords = Array.from(new Set(searchQuery.split(' ').filter(Boolean)));
    const uniqueQueries = keywords.filter((keyword) => {
      return !keywords.find((key) => key !== keyword && key.includes(keyword));
    });

    // Search for each unique query and combine results
    return uniqueQueries.flatMap((query) => fuse.search(query));
  };
}
