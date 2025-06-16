import { defineConfig } from '@lingui/cli';

export default defineConfig({
  sourceLocale: 'en-US',
  locales: ['en-US'],
  catalogs: [
    {
      path: './{locale}',
      include: [
        '<rootDir>/packages/_shared/src',
        '<rootDir>/packages/boolean/src',
        '<rootDir>/packages/checkbox/src',
        '<rootDir>/packages/date/src',
        '<rootDir>/packages/dropdown/src',
        '<rootDir>/packages/json/src',
        '<rootDir>/packages/location/src',
        '<rootDir>/packages/markdown/src',
        '<rootDir>/packages/radio/src',
        '<rootDir>/packages/rating/src',
        '<rootDir>/packages/reference/src',
        '<rootDir>/packages/rich-text/src',
        '<rootDir>/packages/single-line/src',
        '<rootDir>/packages/slug/src',
        '<rootDir>/packages/tags/src',
        '<rootDir>/packages/validation-errors/src',
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
