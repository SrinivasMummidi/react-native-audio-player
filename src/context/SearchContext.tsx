import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SearchState, SearchContextType, TranscriptSegment } from '../types/types';
import { createTranscriptMatcher } from '../lib/search/fuzzySearch';
import { formatSearchMatches, getNextMatchIndex, getPreviousMatchIndex } from '../lib/search/formatMatches';

interface SearchProviderProps {
    children: ReactNode;
    transcriptSegments: TranscriptSegment[];
}

const initialSearchState: SearchState = {
    searchTerm: '',
    matches: [],
    currentMatchIndex: -1,
    isSearching: false,
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<SearchProviderProps> = ({ children, transcriptSegments }) => {
    const [searchState, setSearchState] = useState<SearchState>(initialSearchState);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    const search = useCallback((term: string) => {
        if (!term.trim()) {
            setSearchState(initialSearchState);
            return;
        }

        setSearchState(prev => ({ ...prev, isSearching: true }));

        try {
            const matcher = createTranscriptMatcher(transcriptSegments);
            const fuseResults = matcher(term);
            const matches = formatSearchMatches(fuseResults);

            setSearchState({
                searchTerm: term,
                matches,
                currentMatchIndex: matches.length > 0 ? 0 : -1,
                isSearching: false,
            });

            // Disable auto-scroll when search is performed
            if (matches.length > 0) {
                setShouldAutoScroll(false);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchState({
                searchTerm: term,
                matches: [],
                currentMatchIndex: -1,
                isSearching: false,
            });
        }
    }, [transcriptSegments]);

    const clearSearch = useCallback(() => {
        setSearchState(initialSearchState);
        setShouldAutoScroll(true);
    }, []);

    const nextMatch = useCallback(() => {
        setSearchState(prev => {
            const newIndex = getNextMatchIndex(prev.currentMatchIndex, prev.matches.length);
            setShouldAutoScroll(false);
            return {
                ...prev,
                currentMatchIndex: newIndex,
            };
        });
    }, []);

    const previousMatch = useCallback(() => {
        setSearchState(prev => {
            const newIndex = getPreviousMatchIndex(prev.currentMatchIndex, prev.matches.length);
            setShouldAutoScroll(false);
            return {
                ...prev,
                currentMatchIndex: newIndex,
            };
        });
    }, []);

    const jumpToMatch = useCallback((index: number) => {
        setSearchState(prev => {
            if (index >= 0 && index < prev.matches.length) {
                setShouldAutoScroll(false);
                return {
                    ...prev,
                    currentMatchIndex: index,
                };
            }
            return prev;
        });
    }, []);

    const contextValue: SearchContextType = {
        searchState,
        search,
        clearSearch,
        nextMatch,
        previousMatch,
        jumpToMatch,
        shouldAutoScroll,
        setShouldAutoScroll,
    };

    return (
        <SearchContext.Provider value={contextValue}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = (): SearchContextType => {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};
