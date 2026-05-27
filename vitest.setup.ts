import { vi } from 'vitest';

import '@testing-library/jest-dom';

vi.mock('@lingui/core/macro', () => ({
  t: vi.fn((obj) => {
    if (typeof obj === 'object' && obj.message) {
      return obj.message;
    }
    return obj;
  }),
  plural: vi.fn((count, obj) => {
    if (typeof obj === 'object') {
      const form = count === 1 ? 'one' : 'other';
      const message = obj[form] || obj.other || obj.one || '';
      return message.replace(/#/g, count);
    }
    return obj;
  }),
}));

vi.mock('@lingui/core', () => ({
  i18n: {
    _: vi.fn((obj) => {
      if (typeof obj === 'object' && obj.message) {
        return obj.message;
      }
      return obj;
    }),
    activate: vi.fn(),
    load: vi.fn(),
  },
}));
