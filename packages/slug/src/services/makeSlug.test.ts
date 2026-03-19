import { makeSlug } from './makeSlug';

describe('makeSlug', () => {
  it('should return untitled slug if title is empty', () => {
    expect(
      makeSlug('', {
        locale: 'en',
        isOptionalLocaleWithFallback: false,
        createdAt: '2020-01-14T14:45:39.709Z',
      }),
    ).toBe('untitled-entry-2020-01-14-at-14-45-39');
  });

  it('should respect maxLength when title is present', () => {
    expect(
      makeSlug('a'.repeat(300), {
        locale: 'en',
        isOptionalLocaleWithFallback: false,
        createdAt: '2020-01-14T14:45:39.709Z',
        maxLength: 256,
      }),
    ).toBe('a'.repeat(256));
  });
});
