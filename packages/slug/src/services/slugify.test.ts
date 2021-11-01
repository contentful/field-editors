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
});
