import react from '@vitejs/plugin-react-swc';
import { defineConfig, mergeConfig } from 'vitest/config';

import { createVitestConfig } from '../../vitest.shared';

process.env.TZ = 'UTC';

const baseConfig = createVitestConfig('field-editor-rich-text');

// Many rich-text test files use the `/** @jsx jsx */` pragma to bind JSX to
// `@udecode/plate-test-utils`'s `jsx` factory. The default react-swc plugin
// uses the automatic JSX runtime, which rejects per-file pragmas. We replace
// the default react plugin with one configured for the classic runtime so the
// pragma is honored.
const overriddenPlugins = [
  react({
    useAtYourOwnRisk_mutateSwcOptions(options) {
      const transform = (options.jsc ??= {}).transform ?? {};
      const reactConfig = (transform.react ??= {});
      reactConfig.runtime = 'classic';
      reactConfig.development = false;
      transform.react = reactConfig;
      options.jsc.transform = transform;
    },
  }),
];

export default mergeConfig(
  defineConfig({
    ...baseConfig,
    plugins: overriddenPlugins,
  }),
  defineConfig({
    test: {
      env: {
        TZ: 'UTC',
      },
    },
  }),
);
