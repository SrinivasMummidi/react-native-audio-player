import { platformIOS } from '@rnef/platform-ios';
import { platformAndroid } from '@rnef/platform-android';
import { pluginBrownfieldIos } from '@rnef/plugin-brownfield-ios';
import { pluginBrownfieldAndroid } from '@rnef/plugin-brownfield-android';
import { pluginMetro } from '@rnef/plugin-metro';

export default {
  plugins: [pluginBrownfieldIos(), pluginBrownfieldAndroid()],
  bundler: pluginMetro(),
  platforms: {
    ios: platformIOS(),
    android: platformAndroid(),
  },
  remoteCacheProvider: null,
};
