/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { ContentType, SearchQuery, SpaceAPI } from 'contentful-ui-extensions-sdk';
import { Entry } from '@contentful/field-editor-shared';
import { createEntry } from './fakesFactory';

function identity<T>(item: T): T {
  return item;
}

type CustomizeMockFn = (api: SpaceAPI) => Partial<SpaceAPI>;

export function createFakeSpaceAPI(customizeMock: CustomizeMockFn = identity): SpaceAPI {
  return customizeMock({
    // @ts-ignore
    getContentTypes() {
      const items: ContentType[] = [
        {
          name: 'Example Content Type',
          sys: { id: 'exampleCT', type: 'ContentType' },
          fields: [
            {
              id: 'exField',
              disabled: false,
              localized: false,
              name: 'Example Field',
              omitted: false,
              required: true,
              type: 'Symbol',
              validations: []
            }
          ],
          displayField: 'exField',
          description: ''
        },
        {
          name: 'Another Content Type',
          sys: { id: 'anotherCT', type: 'ContentType' },
          fields: [],
          displayField: '',
          description: ''
        }
      ];

      return Promise.resolve({
        items,
        total: 2,
        skip: 0,
        limit: 100,
        sys: { type: 'Array' }
      });
    },
    // @ts-ignore
    getEntries(query?: SearchQuery) {
      const items: Entry[] = [
        createEntry('exampleCT', { exField: { 'en-US': 'Hello world' } }),
        createEntry('exampleCT', {})
      ];
      return Promise.resolve({
        items: !query || query.content_type === 'exampleCT' ? items : [],
        total: items.length,
        skip: 0,
        limit: 100,
        sys: { type: 'Array' }
      });
    },
    getAssets() {
      return Promise.resolve({
        items: [],
        total: 0,
        skip: 0,
        limit: 100,
        sys: { type: 'Array' }
      });
    },
    // @ts-ignore
    createEntry(contentTypeId: string) {
      return Promise.resolve(createEntry(contentTypeId, {}));
    },
    // @ts-ignore
    createAsset() {
      return Promise.resolve({});
    }
  });
}
