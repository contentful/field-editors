/* eslint-disable */

// Mock Lingui's t function for tests
jest.mock('@lingui/core/macro', () => ({
  t: jest.fn((obj) => {
    if (typeof obj === 'object' && obj.message) {
      return obj.message;
    }
    return obj;
  }),
  plural: jest.fn((count, obj) => {
    if (typeof obj === 'object') {
      // For plural, return 'one' if count is 1, otherwise 'other'
      const form = count === 1 ? 'one' : 'other';
      const message = obj[form] || obj.other || obj.one || '';
      // Replace # placeholder with the actual count
      return message.replace(/#/g, count);
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
