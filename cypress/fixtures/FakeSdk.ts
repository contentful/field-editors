import type { ContentType, FieldAPI, FieldAppSDK } from '@contentful/app-sdk';
import {
  createFakeFieldAPI,
  createFakeLocalesAPI,
  createFakeSpaceAPI,
} from '@contentful/field-editor-test-utils';
import type { LocaleProps } from 'contentful-management';

import { assets, entries } from '../../packages/reference/src/__fixtures__/fixtures';
import { createFakeNavigatorAPI } from './navigator';
import { createFakePubsub } from './pubsub';
import { createDefaultFakeStore, Store } from './store';
import { newLink } from './utils';

export type ReferenceEditorFakeSdkProps = {
  store?: Store;
  ids?: Partial<FieldAppSDK['ids']>;
  initialValue?: unknown;
  validations?: FieldAPI['validations'];
  fetchDelay?: number;
  modifier?: (sdk: FieldAppSDK) => FieldAppSDK;
};

export function createReferenceEditorTestSdk(props?: ReferenceEditorFakeSdkProps): FieldAppSDK {
  const store = props?.store ?? createDefaultFakeStore();
  const initialValue = props?.initialValue;
  const validations = props?.validations;
  const customizeMock = (field: FieldAPI): FieldAPI => {
    return validations ? { ...field, validations } : field;
  };
  const [field] = createFakeFieldAPI(customizeMock, initialValue);
  const [pubsub, onEntityChanged] = createFakePubsub();
  // TODO should go to space API
  const [navigator, navigatorEmitter] = createFakeNavigatorAPI();
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
    newLink('Entry', entries.publishedAndChanged.sys.id),
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

  const localSdk = {
    field,
    locales,
    cma: {
      entry: {
        get: async ({ entryId }) => {
          if (props?.fetchDelay) {
            await delay(props.fetchDelay);
          }

          return store.get('Entry', entryId);
        },
      },
      asset: {
        get: async ({ assetId }) => {
          if (props?.fetchDelay) {
            await delay(props.fetchDelay);
          }

          return store.get('Asset', assetId);
        },
      },
      space: {
        get: async ({ spaceId }) => {
          return store.get('Space', spaceId);
        },
      },
      contentType: {
        get: async ({ contentTypeId }) => {
          return store.get('ContentType', contentTypeId);
        },
        getMany: async () => {
          const items = localizeContentTypes(store.getAll<ContentType>('ContentType'));
          const total = items.length;

          return {
            sys: {
              type: 'Array' as const,
            },
            total,
            skip: 0,
            limit: 1000,
            items,
          };
        },
      },
      locale: {
        getMany: async () => {
          const items = store.getAll<LocaleProps>('Locale');
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
    },
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
          }),
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
    navigator,
    access: {
      can: async () => true,
    },
    ids: props?.ids ?? {
      space: 'space-id',
      environment: 'environment-id',
    },
    parameters: {
      installation: {},
      instance: {},
      invocation: {},
    },
  } as unknown as FieldAppSDK;
  const sdk = props?.modifier?.(localSdk) ?? localSdk;

  cy.wrap({ store, pubsub, navigator: navigatorEmitter }).as('componentFixtures');

  return sdk;
}
