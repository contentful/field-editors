import { getEntityStatus, getResolvedImageUrl, type EntitySys } from './entityHelpers';

describe('getEntityStatus', () => {
  function createEntity(
    props: Pick<
      EntitySys,
      'archivedVersion' | 'type' | 'deletedVersion' | 'publishedVersion' | 'fieldStatus' | 'version'
    >,
  ) {
    return props as EntitySys;
  }

  describe.each(['Entry', 'Asset'])('for entity type %s', (type) => {
    describe('archived', () => {
      test('returns archived if there is an archivedVersion', () => {
        const result = getEntityStatus(
          createEntity({
            archivedVersion: 1,
            type,
            version: 1,
          }),
        );

        expect(result).toEqual('archived');
      });
    });

    describe('deleted', () => {
      test('returns deleted if there is an deletedVersion', () => {
        const result = getEntityStatus(
          createEntity({
            deletedVersion: 1,
            type,
            version: 1,
          }),
        );

        expect(result).toEqual('deleted');
      });
    });

    describe('publish status', () => {
      describe('by field status', () => {
        test('returns changed if at least one fieldStatus is changed', () => {
          const result = getEntityStatus(
            createEntity({
              fieldStatus: {
                '*': {
                  'en-US': 'changed',
                  'de-DE': 'published',
                  'fr-FR': 'draft',
                },
              },
              type,
              version: 1,
            }),
            ['en-US', 'de-DE', 'fr-FR'],
          );

          expect(result).toEqual('changed');
        });

        test('returns published if at least one fieldStatus is published (and none changed)', () => {
          const result = getEntityStatus(
            createEntity({
              fieldStatus: {
                '*': {
                  'en-US': 'published',
                  'de-DE': 'published',
                  'fr-FR': 'draft',
                },
              },
              type,
              version: 1,
            }),
            ['en-US', 'de-DE', 'fr-FR'],
          );

          expect(result).toEqual('published');
        });

        test('returns published if that is the most advanced state for the selected locales', () => {
          const result = getEntityStatus(
            createEntity({
              fieldStatus: {
                '*': {
                  'en-US': 'changed',
                  'de-DE': 'published',
                  'fr-FR': 'draft',
                },
              },
              type,
              version: 1,
            }),
            ['de-DE', 'fr-FR'],
          );

          expect(result).toEqual('published');
        });

        test('returns draft if at least one fieldStatus is draft (and none is changed or published)', () => {
          const result = getEntityStatus(
            createEntity({
              fieldStatus: {
                '*': {
                  'en-US': 'draft',
                  'de-DE': 'draft',
                  'fr-FR': 'draft',
                },
              },
              type,
              version: 1,
            }),
            ['en-US', 'de-DE', 'fr-FR'],
          );

          expect(result).toEqual('draft');
        });

        test('returns draft if that is the most advanced state for the selected locales', () => {
          const result = getEntityStatus(
            createEntity({
              fieldStatus: {
                '*': {
                  'en-US': 'changed',
                  'de-DE': 'published',
                  'fr-FR': 'draft',
                },
              },
              type,
              version: 1,
            }),
            ['fr-FR'],
          );

          expect(result).toEqual('draft');
        });
      });

      describe('by version comparsion', () => {
        test('returns changed if the version is greater than the publishedVersion + 1', () => {
          const result = getEntityStatus(
            createEntity({
              publishedVersion: 1,
              type,
              version: 3,
            }),
          );

          expect(result).toEqual('changed');
        });

        test('returns published if there is a publishedVersion', () => {
          const result = getEntityStatus(
            createEntity({
              publishedVersion: 1,
              type,
              version: 2,
            }),
          );

          expect(result).toEqual('published');
        });

        test('returns draft if there is no publishedVersion', () => {
          const result = getEntityStatus(
            createEntity({
              type,
              version: 2,
            }),
          );

          expect(result).toEqual('draft');
        });
      });
    });
  });
});

describe('getResolvedImageUrl', () => {
  describe('URL parsing and domain replacement', () => {
    test('replaces downloads.ctfassets.net with images.ctfassets.net', () => {
      const result = getResolvedImageUrl('https://downloads.ctfassets.net/space/asset.jpg');
      expect(result).toBe('https://images.ctfassets.net/space/asset.jpg');
    });

    test('handles protocol-relative URLs', () => {
      const result = getResolvedImageUrl('//downloads.ctfassets.net/space/asset.jpg');
      expect(result).toBe('//images.ctfassets.net/space/asset.jpg');
    });

    test('does not modify URLs that are not from downloads.ctfassets.net', () => {
      const result = getResolvedImageUrl('https://example.com/image.jpg');
      expect(result).toBe('https://example.com/image.jpg');
    });

    test('does not modify images.ctfassets.net URLs', () => {
      const result = getResolvedImageUrl('https://images.ctfassets.net/space/asset.jpg');
      expect(result).toBe('https://images.ctfassets.net/space/asset.jpg');
    });
  });

  describe('query parameters', () => {
    test('adds width parameter', () => {
      const result = getResolvedImageUrl('https://downloads.ctfassets.net/space/asset.jpg', {
        w: 100,
      });
      expect(result).toBe('https://images.ctfassets.net/space/asset.jpg?w=100');
    });

    test('adds height parameter', () => {
      const result = getResolvedImageUrl('https://downloads.ctfassets.net/space/asset.jpg', {
        h: 200,
      });
      expect(result).toBe('https://images.ctfassets.net/space/asset.jpg?h=200');
    });

    test('adds fit parameter', () => {
      const result = getResolvedImageUrl('https://downloads.ctfassets.net/space/asset.jpg', {
        fit: 'thumb',
      });
      expect(result).toBe('https://images.ctfassets.net/space/asset.jpg?fit=thumb');
    });

    test('adds multiple parameters', () => {
      const result = getResolvedImageUrl('https://downloads.ctfassets.net/space/asset.jpg', {
        w: 100,
        h: 200,
        fit: 'thumb',
      });
      expect(result).toContain('w=100');
      expect(result).toContain('h=200');
      expect(result).toContain('fit=thumb');
      expect(result).toContain('images.ctfassets.net');
    });

    test('skips undefined parameters', () => {
      const result = getResolvedImageUrl('https://downloads.ctfassets.net/space/asset.jpg', {
        w: 100,
        h: undefined,
        fit: 'thumb',
      });
      expect(result).toBe('https://images.ctfassets.net/space/asset.jpg?w=100&fit=thumb');
    });

    test('returns URL without query string when no params provided', () => {
      const result = getResolvedImageUrl('https://downloads.ctfassets.net/space/asset.jpg');
      expect(result).toBe('https://images.ctfassets.net/space/asset.jpg');
    });

    test('returns URL without query string when all params are undefined', () => {
      const result = getResolvedImageUrl('https://downloads.ctfassets.net/space/asset.jpg', {
        w: undefined,
        h: undefined,
        fit: undefined,
      });
      expect(result).toBe('https://images.ctfassets.net/space/asset.jpg');
    });
  });

  describe('relative URL fallback', () => {
    test('returns relative URL unchanged when no params provided', () => {
      const result = getResolvedImageUrl('/assets/image.jpg');
      expect(result).toBe('/assets/image.jpg');
    });

    test('appends query params to relative URLs', () => {
      const result = getResolvedImageUrl('/assets/image.jpg', {
        w: 100,
        h: 200,
      });
      expect(result).toBe('/assets/image.jpg?w=100&h=200');
    });

    test('handles relative URLs with undefined params', () => {
      const result = getResolvedImageUrl('/assets/image.jpg', {
        w: 100,
        h: undefined,
      });
      expect(result).toBe('/assets/image.jpg?w=100');
    });

    test('returns relative URL unchanged when all params are undefined', () => {
      const result = getResolvedImageUrl('/assets/image.jpg', {
        w: undefined,
        h: undefined,
      });
      expect(result).toBe('/assets/image.jpg');
    });
  });

  describe('edge cases', () => {
    test('preserves existing query parameters', () => {
      const result = getResolvedImageUrl(
        'https://downloads.ctfassets.net/space/asset.jpg?foo=bar',
        {
          w: 100,
        },
      );
      expect(result).toContain('foo=bar');
      expect(result).toContain('w=100');
    });

    test('handles URLs with fragments', () => {
      const result = getResolvedImageUrl(
        'https://downloads.ctfassets.net/space/asset.jpg#section',
        {
          w: 100,
        },
      );
      expect(result).toContain('images.ctfassets.net');
      expect(result).toContain('w=100');
      expect(result).toContain('#section');
    });
  });

  describe('Flinkly domain support', () => {
    test('replaces downloads.flinkly.com with images.flinkly.com', () => {
      const result = getResolvedImageUrl('https://downloads.flinkly.com/space/asset.jpg');
      expect(result).toBe('https://images.flinkly.com/space/asset.jpg');
    });

    test('handles protocol-relative Flinkly URLs', () => {
      const result = getResolvedImageUrl('//downloads.flinkly.com/space/asset.jpg');
      expect(result).toBe('//images.flinkly.com/space/asset.jpg');
    });

    test('adds query params to Flinkly URLs', () => {
      const result = getResolvedImageUrl('https://downloads.flinkly.com/space/asset.jpg', {
        w: 150,
        h: 150,
        fit: 'thumb',
      });
      expect(result).toContain('images.flinkly.com');
      expect(result).toContain('w=150');
      expect(result).toContain('h=150');
      expect(result).toContain('fit=thumb');
    });
  });
});
