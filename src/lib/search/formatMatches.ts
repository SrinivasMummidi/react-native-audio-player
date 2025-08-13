import { FuseResult } from 'fuse.js';
import { SearchableWord } from './fuzzySearch';
import { SearchMatch } from '../../types/types';

/**
 * Converts Fuse.js search results to formatted matches with character positions
 * Based on audio-transcript-player's getFormattedMatches implementation
 */
export function formatSearchMatches(fuseResults: FuseResult<SearchableWord>[]): SearchMatch[] {
  const formatted: SearchMatch[] = fuseResults
    .flatMap((result) => {
      const { segmentIndex, wordIndex } = result.item;
      
      return (
        result.matches?.flatMap((match) =>
          match.indices.map(([start, end]) => ({
            segmentIndex,
            wordIndex,
            start,
            end,
          }))
        ) || []
      );
    })
    // Sort by segment first, then by word index
    .sort((a, b) => {
      if (a.segmentIndex !== b.segmentIndex) {
        return a.segmentIndex - b.segmentIndex;
      }
      return a.wordIndex - b.wordIndex;
    })
    // Merge overlapping matches within the same word
    .reduce((acc, curr) => {
      if (acc.length === 0) {
        return [curr];
      }

      const prev = acc[acc.length - 1];
      
      // Check if this match is in the same word and overlaps with the previous
      if (
        curr.segmentIndex === prev.segmentIndex &&
        curr.wordIndex === prev.wordIndex &&
        curr.start <= prev.end + 1 // Allow for adjacent matches
      ) {
        // Merge the matches by extending the end position
        prev.end = Math.max(prev.end, curr.end);
        return acc;
      }

      acc.push(curr);
      return acc;
    }, [] as SearchMatch[]);

  return formatted;
}

/**
 * Finds the next match index in a circular manner
 */
export function getNextMatchIndex(currentIndex: number, totalMatches: number): number {
  if (totalMatches === 0) return -1;
  return (currentIndex + 1) % totalMatches;
}

/**
 * Finds the previous match index in a circular manner
 */
export function getPreviousMatchIndex(currentIndex: number, totalMatches: number): number {
  if (totalMatches === 0) return -1;
  return currentIndex <= 0 ? totalMatches - 1 : currentIndex - 1;
}
