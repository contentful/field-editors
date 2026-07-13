import { describe, expect, test } from 'vitest';

import { isLoadingStatus } from './isLoadingStatus';

describe('isLoadingStatus', () => {
  test.each(['loading', 'idle', 'pending'])('returns true for %s', (status) => {
    expect(isLoadingStatus(status)).toBe(true);
  });

  test.each(['success', 'error'])('returns false for %s', (status) => {
    expect(isLoadingStatus(status)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isLoadingStatus(undefined)).toBe(false);
  });
});
