module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // react-native-reanimated must be listed last.
      // Note: do NOT add react-native-worklets/plugin here —
      // reanimated 4.x includes it internally and listing it
      // twice causes a Babel "Duplicate plugin" error.
      "react-native-reanimated/plugin",
    ],
  };
};
