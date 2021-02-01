import { ContentType, SearchQuery, SpaceAPI } from '@contentful/app-sdk';
import { Entry } from '@contentful/field-editor-shared';
import { createEntry } from './fakesFactory';

function identity<T>(item: T): T {
  return item;
}

type CustomizeMockFn = (api: SpaceAPI) => SpaceAPI;

const testContentTypes: ContentType[] = [
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
        validations: [],
      },
      {
        id: 'exDesc',
        disabled: false,
        localized: false,
        name: 'Description Field',
        omitted: false,
        required: false,
        type: 'Text',
        validations: [],
      },
    ],
    displayField: 'exField',
    description: '',
  },
  {
    name: 'Another Content Type',
    sys: { id: 'anotherCT', type: 'ContentType' },
    fields: [],
    displayField: '',
    description: '',
  },
];

export function createFakeSpaceAPI(customizeMock: CustomizeMockFn = identity): SpaceAPI {
  return customizeMock(({
    getCachedContentTypes() {
      return testContentTypes;
    },
    getContentTypes() {
      return Promise.resolve({
        items: testContentTypes,
        total: testContentTypes.length,
        skip: 0,
        limit: 100,
        sys: { type: 'Array' },
      });
    },
    getEntries(query?: SearchQuery) {
      const items: Entry[] = [
        createEntry('exampleCT', { exField: { 'en-US': 'Hello world' } }),
        createEntry('exampleCT', {}),
      ];
      return Promise.resolve({
        items: !query || query.content_type === 'exampleCT' ? items : [],
        total: items.length,
        skip: 0,
        limit: 100,
        sys: { type: 'Array' },
      });
    },
    getAssets() {
      return Promise.resolve({
        items: [],
        total: 0,
        skip: 0,
        limit: 100,
        sys: { type: 'Array' },
      });
    },
    createEntry(contentTypeId: string) {
      return Promise.resolve(createEntry(contentTypeId, {}));
    },
    createAsset() {
      return Promise.resolve({});
    },
  } as unknown) as SpaceAPI);
}
