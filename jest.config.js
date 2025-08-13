module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '\\.(svg)$': '<rootDir>/__mocks__/svgMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!react-native|@react-native|react-native-gesture-handler|react-native-reanimated|@react-native-community)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
