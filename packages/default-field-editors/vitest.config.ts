import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';

import { createVitestConfig } from '../../vitest.shared';

const dirname = fileURLToPath(new URL('.', import.meta.url));

export default mergeConfig(
  defineConfig(createVitestConfig('default-field-editors')),
  defineConfig({
    test: {
      alias: [{ find: /\.css$/, replacement: resolve(dirname, 'src/__mocks__/styles.ts') }],
      server: {
        deps: {
          inline: ['rehype-raw'],
        },
      },
    },
  }),
);
