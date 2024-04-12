import React from 'react';
import type { ReactElement } from 'react-markdown/lib/react-markdown';

import type {
  ContentType,
  FieldAPI,
  FieldAppSDK,
  SearchQuery,
  Entry,
  Asset,
} from '@contentful/app-sdk';
import {
  AssetCard,
  Button,
  EntryCard,
  ModalContent,
  ModalControls,
} from '@contentful/f36-components';
import { ModalDialogLauncher } from '@contentful/field-editor-shared';
import {
  createFakeCMAAdapter,
  createFakeFieldAPI,
  createFakeLocalesAPI,
  createFakeSpaceAPI,
} from '@contentful/field-editor-test-utils';
import type { LocaleProps } from 'contentful-management';

import { assets, entries, resources } from '../../packages/rich-text/src/__fixtures__/fixtures';
import { createFakeNavigatorAPI } from './navigator';
import { createFakePubsub } from './pubsub';
import { createDefaultFakeStore, Store } from './store';

const ID = 'fake-dialog';

export function cancelFakeDialog() {
  cy.findByTestId(`${ID}-cancel-cta`).click();
}

export function confirmFakeDialog() {
  cy.findByTestId(`${ID}-confirm-cta`).click();
}

function createOpenDialog(component: ReactElement, value: any) {
  return () =>
    ModalDialogLauncher.openDialog({ title: 'Rich Text Embed Dialog Mock' }, ({ onClose }) => {
      return (
        <>
          <ModalContent>{component}</ModalContent>
          <ModalControls>
            <Button
              type="button"
              onClick={() => onClose(null)}
              variant="secondary"
              testId={`${ID}-cancel-cta`}
              size="small"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="positive"
              onClick={() => onClose(value)}
              testId={`${ID}-confirm-cta`}
              size="small"
            >
              Submit
            </Button>
          </ModalControls>
        </>
      );
    }) as Promise<any>;
}

type RichTextFakeSdkProps = {
  store?: Store;
  ids?: Partial<FieldAppSDK['ids']>;
  initialValue?: unknown;
  validations?: FieldAPI['validations'];
  fetchDelay?: number;
  modifier?: (sdk: FieldAppSDK) => FieldAppSDK;
};

export function createRichTextFakeSdk(props?: RichTextFakeSdkProps): FieldAppSDK {
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
    }),
    space: {
      ...space,
      getEntries(query?: SearchQuery) {
        const items: Entry[] = [entries.published, entries.changed, entries.empty];
        return Promise.resolve({
          items: !query || query.content_type === 'exampleCT' ? items : [],
          total: items.length,
          skip: 0,
          limit: 100,
          sys: { type: 'Array' },
        });
      },
      getAssets(query?: SearchQuery) {
        const items: Asset[] = [
          assets.published as unknown as Asset,
          assets.changed as unknown as Asset,
        ];
        return Promise.resolve({
          items: query ? items : [],
          total: items.length,
          skip: 0,
          limit: 100,
          sys: { type: 'Array' },
        });
      },
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
      selectSingleAsset: createOpenDialog(
        <AssetCard
          src={assets.published.fields.file['en-US'].url}
          title={assets.published.fields.title['en-US']}
        />,
        assets.published
      ),
      selectMultipleAssets: async () => [assets.published, assets.changed],
      selectSingleEntry: createOpenDialog(
        <EntryCard title={entries.published.fields.exField['en-US']} />,
        entries.published
      ),
      selectSingleResourceEntity: createOpenDialog(
        <EntryCard title={resources.published.sys.urn} />,
        resources.published
      ),
      selectMultipleEntries: async () => [entries.published, entries.changed],
    },
    entry: {
      getSys: () => entries.published.sys,
    },
    navigator,
    access: {
      can: async () => true,
    },
    ids: props?.ids ?? {
      space: 'space-id',
      environment: 'environment-id',
    },
  } as unknown as FieldAppSDK;
  const sdk = props?.modifier?.(localSdk) ?? localSdk;

  cy.wrap({ store, pubsub, navigator: navigatorEmitter }).as('componentFixtures');
  cy.wrap(field).as('richTextFieldSDK');

  return sdk;
}
