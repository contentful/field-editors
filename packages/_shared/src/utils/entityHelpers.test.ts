import { getEntityStatus, type EntitySys } from './entityHelpers';

describe('getEntityStatus', () => {
  function createEntity(
    props: Pick<
      EntitySys,
      'archivedVersion' | 'type' | 'deletedVersion' | 'publishedVersion' | 'fieldStatus' | 'version'
    >
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
          })
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
          })
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
            ['en-US', 'de-DE', 'fr-FR']
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
            ['en-US', 'de-DE', 'fr-FR']
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
            ['de-DE', 'fr-FR']
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
            ['en-US', 'de-DE', 'fr-FR']
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
            ['fr-FR']
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
            })
          );

          expect(result).toEqual('changed');
        });

        test('returns published if there is a publishedVersion', () => {
          const result = getEntityStatus(
            createEntity({
              publishedVersion: 1,
              type,
              version: 2,
            })
          );

          expect(result).toEqual('published');
        });

        test('returns draft if there is no publishedVersion', () => {
          const result = getEntityStatus(
            createEntity({
              type,
              version: 2,
            })
          );

          expect(result).toEqual('draft');
        });
      });
    });
  });
});
