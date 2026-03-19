import { slugify } from './slugify';

describe('slugify', () => {
  const cases = [
    ['We ♥ $ & €', 'we-love-usd-and-eur'],
    ['it`s a Slug', 'its-a-slug'],
    ['it’S a slug', 'its-a-slug'],
    ["it's a SLUG", 'its-a-slug'],
  ];

  cases.forEach((input) => {
    it(`converts "${input[0]}" to "${input[1]}"`, () => {
      expect(slugify(input[0])).toBe(input[1]);
    });
  });

  it('defaults to a 75 character limit', () => {
    expect(slugify('a'.repeat(80))).toBe('a'.repeat(75));
  });

  it('accepts a custom max length', () => {
    expect(slugify('a'.repeat(80), 'en', 80)).toBe('a'.repeat(80));
  });

  it('does not cut off words when a custom max length is provided', () => {
    expect(slugify('one two three four', 'en', 13)).toBe('one-two-three');
  });
});
