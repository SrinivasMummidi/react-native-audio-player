import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useSearch } from '../../context/SearchContext';
import { ChevronUpIcon, ChevronDownIcon } from './ChevronIcons';
import SearchIcon from '../../assets/icons/search.svg';

interface SearchInputProps {
  placeholder?: string;
  style?: any;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search transcript...',
  style,
}) => {
  const { searchState, search, clearSearch, nextMatch, previousMatch } =
    useSearch();
  const [inputValue, setInputValue] = useState(searchState.searchTerm);

  const handleSearch = useCallback(
    (text: string) => {
      setInputValue(text);
      search(text);
    },
    [search],
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    clearSearch();
  }, [clearSearch]);

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (e.nativeEvent.key === 'Enter') {
        nextMatch();
      }
      // Note: React Native doesn't support Shift+Enter detection like web
      // We'll add separate navigation buttons for better UX
    },
    [nextMatch],
  );

  const hasResults = searchState.matches.length > 0;
  const hasSearchTerm = searchState.searchTerm.length > 0;

  return (
    <View
      style={[
        styles.container,
        hasSearchTerm && styles.containerWithResults,
        style,
      ]}
    >
      <View style={styles.inputContainer}>
        <View style={styles.searchIconWrap}>
          <SearchIcon width={14} height={14} fill="#9ca3af" />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={inputValue}
          onChangeText={handleSearch}
          onKeyPress={handleKeyPress}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />

        {inputValue.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {hasSearchTerm && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsText}>
              {searchState.isSearching
                ? 'Searching...'
                : hasResults
                ? `${searchState.matches.length} result${
                    searchState.matches.length !== 1 ? 's' : ''
                  }`
                : 'No results'}
            </Text>
          </View>

          {hasResults && (
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  !hasResults && styles.navButtonDisabled,
                ]}
                onPress={nextMatch}
                activeOpacity={0.7}
                disabled={!hasResults}
              >
                <ChevronDownIcon
                  size={14}
                  color={hasResults ? '#6b7280' : '#d1d5db'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navButton,
                  !hasResults && styles.navButtonDisabled,
                ]}
                onPress={previousMatch}
                activeOpacity={0.7}
                disabled={!hasResults}
              >
                <ChevronUpIcon
                  size={14}
                  color={hasResults ? '#6b7280' : '#d1d5db'}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingBottom: 4,
    paddingRight: 10,
    gap: 4,
  },
  containerWithResults: {
    paddingBottom: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    minHeight: 32,
  },
  searchIconWrap: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    width: 16,
  },
  input: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
  },
  clearButton: {
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  resultsContainer: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
    paddingRight: 4,
  },
  resultsInfo: {
    flex: 1,
  },
  resultsText: {
    fontSize: 10,
    color: '#6b7280',
    fontVariant: ['tabular-nums'],
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  navButton: {
    height: 24,
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: 'bold',
  },
});

export default SearchInput;
