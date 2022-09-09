import { ContentType, FieldAPI, FieldExtensionSDK, Link } from '@contentful/app-sdk';
import {
  createFakeCMAAdapter,
  createFakeFieldAPI,
  createFakeLocalesAPI,
  createFakeSpaceAPI,
} from '@contentful/field-editor-test-utils';
import type { Emitter } from 'mitt';

import { assets, entries } from '../../packages/reference/src/__fixtures__/fixtures';
import { createFakePubsub } from './pubsub';
import { createDefaultFakeStore, Store } from './store';

const newLink = (linkType: string, id: string): Link => ({
  sys: {
    id,
    linkType,
    type: 'Link',
  },
});

// used for component testing
export type ReferenceEditorSdkProps = {
  store?: Store;
  ids?: Partial<FieldExtensionSDK['ids']>;
  initialValue?: unknown;
  validations?: unknown;
  fetchDelay?: number;
};

export function newReferenceEditorFakeSdk(
  props?: ReferenceEditorSdkProps
): [FieldExtensionSDK, Emitter] {
  const store = props?.store ?? createDefaultFakeStore();
  const rawInitialValue = window.localStorage.getItem('initialValue');
  const initialValue = rawInitialValue ? JSON.parse(rawInitialValue) : props?.initialValue;
  const rawValidations = window.localStorage.getItem('fieldValidations');
  const validations = rawValidations ? JSON.parse(rawValidations) : props?.validations;
  const customizeMock = (field: FieldAPI): FieldAPI => {
    return validations ? { ...field, validations } : field;
  };
  const [field, mitt] = createFakeFieldAPI(customizeMock, initialValue);
  const [pubsub, onEntityChanged] = createFakePubsub();
  const space = createFakeSpaceAPI((api) => {
    return {
      ...api,
      onEntityChanged,
    };
  });
  const locales = createFakeLocalesAPI();
  const entryLinks = [
    newLink('Entry', entries.published.sys.id),
    newLink('Entry', entries.changed.sys.id),
    newLink('Entry', entries.empty.sys.id),
  ];
  const assetLinks = [
    newLink('Asset', assets.published.sys.id),
    newLink('Asset', assets.changed.sys.id),
    newLink('Asset', assets.empty.sys.id),
  ];
  let selectorCounter = 0;

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const localizeContentTypes = (contentTypes: ContentType[]) => {
    return contentTypes.map((contentType) => ({
      ...contentType,
      fields: contentType.fields.map((field) => ({
        ...field,
        localized: true,
      })),
    }));
  };

  const sdk = {
    field,
    locales,
    cmaAdapter: createFakeCMAAdapter({
      Entry: {
        get: async ({ entryId }) => {
          if (props?.fetchDelay) {
            await delay(props.fetchDelay);
          }

          return store.get('Entry', entryId);
        },
      },
      Asset: {
        get: async ({ assetId }) => {
          if (props?.fetchDelay) {
            await delay(props.fetchDelay);
          }

          return store.get('Asset', assetId);
        },
      },
      Space: {
        get: async ({ spaceId }) => {
          return store.get('Space', spaceId);
        },
      },
      ContentType: {
        get: async ({ contentTypeId }) => {
          return store.get('ContentType', contentTypeId);
        },
      },
      Locale: {
        getMany: async () => {
          const items = store.getAll('Locale');
          const total = items.length;

          return {
            sys: {
              type: 'Array',
            },
            total,
            skip: 0,
            limit: Math.max(total, 100),
            items,
          };
        },
      },
    }),
    space: {
      ...space,
      getCachedContentTypes() {
        return localizeContentTypes(space.getCachedContentTypes());
      },
      getContentTypes() {
        return Promise.resolve(
          space.getContentTypes().then((response) => {
            return {
              ...response,
              items: localizeContentTypes(response.items),
            };
          })
        );
      },
      async getEntityScheduledActions() {
        return [];
      },
    },
    dialogs: {
      selectSingleAsset: async () => {
        selectorCounter++;
        return assetLinks[selectorCounter % assetLinks.length];
      },
      selectMultipleAssets: async () => {
        selectorCounter++;
        return selectorCounter % 2 ? assetLinks.slice(0, 2) : [assetLinks[2]];
      },
      selectSingleEntry: async () => {
        selectorCounter++;
        return entryLinks[selectorCounter % entryLinks.length];
      },
      selectMultipleEntries: async () => {
        selectorCounter++;
        return selectorCounter % 2 ? entryLinks.slice(0, 2) : [entryLinks[2]];
      },
    },
    navigator: {
      openNewAsset: async () => ({
        entity: newLink('Asset', assets.empty.sys.id),
      }),
      openAsset: async () => {
        alert('open Asset in slide in');
        return {};
      },
      openNewEntry: async () => ({
        entity: newLink('Entry', entries.empty.sys.id),
      }),
      openEntry: async () => {
        alert('open entry in slide in');
        return {};
      },
      onSlideInNavigation: () => () => ({}),
    },
    access: {
      can: async () => true,
    },
    ids: props?.ids ?? {
      space: 'space-id',
      environment: 'environment-id',
    },
  } as unknown as FieldExtensionSDK;

  cy.wrap({ store, pubsub }).as('fixtures');

  return [sdk, mitt];
}
