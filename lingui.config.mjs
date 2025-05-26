import { defineConfig } from '@lingui/cli';

export default defineConfig({
  sourceLocale: 'en-US',
  locales: ['en-US'],
  catalogs: [
    {
      path: './{locale}',
      include: [
        '<rootDir>/packages/_shared/src',
      ],
      exclude: [
        '**/node_modules/**',
        '**/svg/**',
        '**/cypress/**',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/stories/**',
        '**/?(*.)(cy|spec|test|stories|styles).[jt]s?(x)',
      ],
    },
  ],
  orderBy: 'messageId',
});
