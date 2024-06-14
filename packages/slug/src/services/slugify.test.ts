import { slugify } from './slugify';

describe('slugify', () => {
  const cases = [
    { input: 'We ♥ $ & €', output: 'we-love-usd-and-eur' },
    { input: 'it`s a Slug', output: 'its-a-slug' },
    { input: 'it’S a slug', output: 'its-a-slug' },
    { input: "it's a SLUG", output: 'its-a-slug' },
    // Swedish
    { input: 'mr Åhlin goes to Malmö', output: 'mr-ahlin-goes-to-malmo', locale: 'sv' },
    // Danish
    //{ input: 'Forårsjævndøgn', output: 'foraarsjaevndoegn', locale: 'dk' },
    // Finnish for ice cream cone
    { input: 'jäätelötötterö', output: 'jaatelotottero', locale: 'fi' },
  ];

  cases.forEach(({ input, output, locale }) => {
    it(`converts "${input}" to "${output}"`, () => {
      expect(slugify(input, locale)).toBe(output);
    });
  });
});
