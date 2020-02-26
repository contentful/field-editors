/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { SearchQuery, SpaceAPI } from 'contentful-ui-extensions-sdk';
import { ContentType, Entry } from '@contentful/field-editor-reference/src/types';
import { createEntry } from './fakesFactory';

function identity<T>(item: T): T {
  return item;
}

type CustomizeMockFn = (api: SpaceAPI) => SpaceAPI;

export function createFakeSpaceAPI(customizeMock: CustomizeMockFn = identity): SpaceAPI {
  return customizeMock({
    getContentTypes<T = ContentType>() {
      const items: T[] = [
        // @ts-ignore
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
        // @ts-ignore
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
    getEntries(query: SearchQuery) {
      const items: Entry[] =
        query.content_type === 'exampleCT'
          ? [
              // @ts-ignore
              createEntry('exampleCT', { exField: { 'en-US': 'Hello world' } }),
              // @ts-ignore
              createEntry('exampleCT', {})
            ]
          : [];
      return Promise.resolve({
        items,
        total: items.length,
        skip: 0,
        limit: 100,
        sys: { type: 'Array' }
      });
    },
    getAssets<T>() {
      const items: T[] = [];

      return Promise.resolve({
        items,
        total: 0,
        skip: 0,
        limit: 100,
        sys: { type: 'Array' }
      });
    },
    createEntry<T = Entry>(contentTypeId: string) {
      // @ts-ignore
      return Promise.resolve<T>(createEntry(contentTypeId, {}));
    },
    // @ts-ignore
    createAsset<T>() {
      return Promise.resolve({});
    }
  });
}
