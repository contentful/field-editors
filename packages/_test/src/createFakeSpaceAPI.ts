/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { SearchQuery, SpaceAPI } from 'contentful-ui-extensions-sdk';
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
      return Promise.resolve({
        items: [
          {
            name: 'Example Content Type',
            sys: { id: 'exampleCT', type: 'ContentType' },
            fields: [
              {
                id: 'exField',
                disabled: false,
                localize: false,
                name: 'Example Field',
                omitted: false,
                required: true,
                type: 'Symbol',
                validations: {}
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
        ],
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
