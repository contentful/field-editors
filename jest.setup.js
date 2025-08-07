/* eslint-disable */

// Mock Lingui's t function for tests
jest.mock('@lingui/core/macro', () => ({
  t: jest.fn((obj) => {
    if (typeof obj === 'object' && obj.message) {
      return obj.message;
    }
    return obj;
  }),
}));

// Mock Lingui's i18n instance
jest.mock('@lingui/core', () => ({
  i18n: {
    _: jest.fn((obj) => {
      if (typeof obj === 'object' && obj.message) {
        return obj.message;
      }
      return obj;
    }),
    activate: jest.fn(),
    load: jest.fn(),
  },
}));
