import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import * as matchers from 'vitest-axe/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

vi.mock('@lingui/core/macro', () => ({
  t: vi.fn((obj) => {
    if (typeof obj === 'object' && obj.message !== undefined) {
      return typeof obj.message === 'string' ? obj.message : String(obj.message);
    }
    return String(obj);
  }),
  plural: vi.fn((count, forms) => {
    const form = count === 1 ? 'one' : 'other';
    const template = String(forms[form] ?? forms.other ?? forms.one ?? '');
    return template.replace(/#/g, String(count)).replace(/\{count\}/g, String(count));
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
