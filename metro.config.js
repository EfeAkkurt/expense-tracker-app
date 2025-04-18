const { getDefaultConfig } = require('@expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// .cjs dosyalarını tanı
defaultConfig.resolver.sourceExts.push('cjs');

// Reanimated ile sar
module.exports = wrapWithReanimatedMetroConfig(defaultConfig);