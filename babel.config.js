module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'babel-plugin-react-compiler',
      {
        // Enable React Compiler optimizations
      },
    ],
    'react-native-reanimated/plugin', // Keep this last as recommended
  ],
};
