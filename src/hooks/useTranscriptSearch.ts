import { useCallback } from 'react';
import { useSearch } from '../context/SearchContext';

/**
 * Custom hook that provides search utilities for transcript components
 */
export const useTranscriptSearch = () => {
  const {
    searchState,
    search,
    clearSearch,
    nextMatch,
    previousMatch,
    jumpToMatch,
    shouldAutoScroll,
    setShouldAutoScroll,
  } = useSearch();

  // Get current highlighted match for display
  const getCurrentMatch = useCallback(() => {
    if (searchState.currentMatchIndex >= 0 && searchState.matches.length > 0) {
      return searchState.matches[searchState.currentMatchIndex];
    }
    return null;
  }, [searchState.currentMatchIndex, searchState.matches]);

  // Check if a specific word should be highlighted
  const isWordHighlighted = useCallback(
    (segmentIndex: number, wordIndex: number) => {
      return searchState.matches.some(
        match =>
          match.segmentIndex === segmentIndex && match.wordIndex === wordIndex,
      );
    },
    [searchState.matches],
  );

  // Check if a specific word is the current match
  const isCurrentMatch = useCallback(
    (segmentIndex: number, wordIndex: number) => {
      const currentMatch = getCurrentMatch();
      return currentMatch
        ? currentMatch.segmentIndex === segmentIndex &&
            currentMatch.wordIndex === wordIndex
        : false;
    },
    [getCurrentMatch],
  );

  // Get all matches for a specific word
  const getWordMatches = useCallback(
    (segmentIndex: number, wordIndex: number) => {
      return searchState.matches.filter(
        match =>
          match.segmentIndex === segmentIndex && match.wordIndex === wordIndex,
      );
    },
    [searchState.matches],
  );

  // Search with debouncing (can be extended)
  const performSearch = useCallback(
    (term: string) => {
      search(term);
    },
    [search],
  );

  return {
    // Search state
    searchTerm: searchState.searchTerm,
    matches: searchState.matches,
    currentMatchIndex: searchState.currentMatchIndex,
    isSearching: searchState.isSearching,
    hasResults: searchState.matches.length > 0,

    // Actions
    search: performSearch,
    clearSearch,
    nextMatch,
    previousMatch,
    jumpToMatch,

    // Utilities
    getCurrentMatch,
    isWordHighlighted,
    isCurrentMatch,
    getWordMatches,

    // Auto-scroll control
    shouldAutoScroll,
    setShouldAutoScroll,
  };
};
