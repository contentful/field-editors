import { ContentType, SearchQuery, SpaceAPI, Entry } from '@contentful/app-sdk';

import { createEntry, createAsset } from './fakesFactory';

function identity<T>(item: T): T {
  return item;
}

type CustomizeMockFn = (api: SpaceAPI) => SpaceAPI;

const testContentTypes: ContentType[] = [
  {
    name: 'Example Content Type',
    sys: {
      id: 'exampleCT',
      type: 'ContentType',
      space: { sys: { id: 'space', type: 'link', linkType: 'Space' } },
      environment: { sys: { id: 'env', type: 'link', linkType: 'Environment' } },
      version: 1,
      createdAt: '2020-08-11T09:30:29.326Z',
      updatedAt: '2020-08-11T09:30:29.326Z',
    },
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
    sys: {
      id: 'anotherCT',
      type: 'ContentType',
      space: { sys: { id: 'space', type: 'link', linkType: 'Space' } },
      environment: { sys: { id: 'env', type: 'link', linkType: 'Environment' } },
      version: 1,
      createdAt: '2020-08-11T09:30:29.326Z',
      updatedAt: '2020-08-11T09:30:29.326Z',
    },
    fields: [],
    displayField: '',
    description: '',
  },
];

export function createFakeSpaceAPI(customizeMock: CustomizeMockFn = identity): SpaceAPI {
  return customizeMock({
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
    getEntry() {
      return Promise.resolve(createEntry('exampleCT', { exField: { 'en-US': 'Hello world' } }));
    },
    getAsset() {
      return Promise.resolve(createAsset({ title: { 'en-US': 'Cat' }, file: {} }));
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
  } as unknown as SpaceAPI);
}
