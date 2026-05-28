import { defineConfig, mergeConfig } from 'vitest/config';

import { createVitestConfig } from '../../vitest.shared';

process.env.TZ = 'UTC';

export default mergeConfig(
  defineConfig(createVitestConfig('field-editor-reference')),
  defineConfig({
    test: {
      env: {
        TZ: 'UTC',
      },
    },
  }),
);
