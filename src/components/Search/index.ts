// Search components
export { default as SearchInput } from './SearchInput';
export { default as HighlightableText } from './HighlightableText';
export { ChevronUpIcon, ChevronDownIcon } from './ChevronIcons';

// Search context and hooks
export { SearchProvider, useSearch } from '../../context/SearchContext';

export { useTranscriptSearch } from '../../hooks/useTranscriptSearch';

// Search utilities
export { createTranscriptMatcher } from '../../lib/search/fuzzySearch';
export { formatSearchMatches } from '../../lib/search/formatMatches';

// Types
export type {
  SearchMatch,
  SearchState,
  SearchContextType,
} from '../../types/types';
