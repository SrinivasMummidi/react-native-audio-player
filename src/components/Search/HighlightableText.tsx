import React, { ReactNode } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useSearch } from '../../context/SearchContext';
import { SearchMatch } from '../../types/types';

interface HighlightableTextProps {
    text: string;
    segmentIndex: number;
    wordIndex: number;
    style?: any;
    onPress?: () => void;
}

/**
 * A React Native Text component that highlights search matches
 * Uses nested Text components for highlighting (React Native approach)
 */
const HighlightableText: React.FC<HighlightableTextProps> = ({
    text,
    segmentIndex,
    wordIndex,
    style,
    onPress,
}) => {
    const { searchState } = useSearch();

    // If no search matches, render plain text
    if (searchState.matches.length === 0) {
        return (
            <Text style={[styles.baseText, style]} onPress={onPress}>
                {text}
            </Text>
        );
    }

    // Find matches for this specific word
    const wordMatches = searchState.matches.filter(
        (match: SearchMatch) =>
            match.segmentIndex === segmentIndex && match.wordIndex === wordIndex
    );

    // If no matches for this word, render plain text
    if (wordMatches.length === 0) {
        return (
            <Text style={[styles.baseText, style]} onPress={onPress}>
                {text}
            </Text>
        );
    }

    // Get current match for highlighting
    const currentMatch = searchState.currentMatchIndex >= 0
        ? searchState.matches[searchState.currentMatchIndex]
        : null;

    // Build highlighted text with nested Text components
    const renderHighlightedText = (): ReactNode[] => {
        const result: ReactNode[] = [];
        let lastIndex = 0;

        // Sort matches by start position
        const sortedMatches = [...wordMatches].sort((a, b) => a.start - b.start);

        sortedMatches.forEach((match, index) => {
            const { start, end } = match;

            // Add text before highlight
            if (start > lastIndex) {
                result.push(
                    <Text key={`before-${index}`} style={[styles.baseText, style]}>
                        {text.substring(lastIndex, start)}
                    </Text>
                );
            }

            // Determine if this is the current highlight
            const isCurrentHighlight = currentMatch &&
                currentMatch.segmentIndex === segmentIndex &&
                currentMatch.wordIndex === wordIndex &&
                currentMatch.start === start &&
                currentMatch.end === end;

            // Add highlighted text
            result.push(
                <Text
                    key={`highlight-${index}`}
                    style={[
                        styles.baseText,
                        style,
                        styles.highlight,
                        isCurrentHighlight && styles.currentHighlight
                    ]}
                >
                    {text.substring(start, end + 1)}
                </Text>
            );

            lastIndex = end + 1;
        });

        // Add remaining text after last highlight
        if (lastIndex < text.length) {
            result.push(
                <Text key="after" style={[styles.baseText, style]}>
                    {text.substring(lastIndex)}
                </Text>
            );
        }

        return result;
    };

    return (
        <Text style={[styles.baseText, style]} onPress={onPress}>
            {renderHighlightedText()}
        </Text>
    );
};

const styles = StyleSheet.create({
    baseText: {
        fontSize: 12,
        lineHeight: 24,
        color: '#6b7280',
        marginRight: 2,
    },
    highlight: {
        // No background color for regular matches - only font weight like web version
        fontWeight: '600', // font-stronger equivalent
        borderRadius: 2,
        paddingHorizontal: 1,
    },
    currentHighlight: {
        backgroundColor: '#fff7d9', // bg-palette-yellow-background equivalent (light yellow)
        color: '#000000', // Keep text dark for better contrast on light yellow
        fontWeight: '600', // font-stronger
    },
});

export default HighlightableText;
