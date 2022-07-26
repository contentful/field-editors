import { FieldAPI, Link } from '@contentful/app-sdk';
import {
  createFakeCMAAdapter,
  createFakeFieldAPI,
  createFakeLocalesAPI,
  createFakeSpaceAPI,
} from '@contentful/field-editor-test-utils';
import { Emitter } from 'mitt';

import { FieldExtensionSDK } from '../types';
import changedAsset from './changed_asset.json';
import changedEntry from './changed_entry.json';
import emptyAsset from './empty_asset.json';
import emptyEntry from './empty_entry.json';
import publishedAsset from './published_asset.json';
import publishedEntry from './published_entry.json';

const newLink = (linkType: string, id: string): Link => ({
  sys: {
    id,
    linkType,
    type: 'Link',
  },
});

// used for component testing
export type ReferenceEditorSdkProps = {
  initialValue?: any;
  validations?: any;
};

export function newReferenceEditorFakeSdk(
  props?: ReferenceEditorSdkProps
): [FieldExtensionSDK, Emitter] {
  const rawInitialValue = window.localStorage.getItem('initialValue');
  const initialValue = rawInitialValue ? JSON.parse(rawInitialValue) : props?.initialValue;
  const rawValidations = window.localStorage.getItem('fieldValidations');
  const validations = rawValidations ? JSON.parse(rawValidations) : props?.validations;
  const customizeMock = (field: FieldAPI): FieldAPI => {
    return validations ? { ...field, validations } : field;
  };
  const [field, mitt] = createFakeFieldAPI(customizeMock, initialValue);
  const space = createFakeSpaceAPI();
  const locales = createFakeLocalesAPI();
  const entryLinks = [
    newLink('Entry', publishedEntry.sys.id),
    newLink('Entry', changedEntry.sys.id),
    newLink('Entry', emptyEntry.sys.id),
  ];
  const assetLinks = [
    newLink('Asset', publishedAsset.sys.id),
    newLink('Asset', changedAsset.sys.id),
    newLink('Asset', emptyAsset.sys.id),
  ];
  let selectorCounter = 0;
  const sdk = {
    field,
    locales,
    cmaAdapter: createFakeCMAAdapter({
      Entry: {
        get: async ({ entryId }) => {
          if (entryId === emptyEntry.sys.id) {
            return emptyEntry;
          }
          if (entryId === publishedEntry.sys.id) {
            return publishedEntry;
          }
          if (entryId === changedEntry.sys.id) {
            return changedEntry;
          }
          return Promise.reject();
        },
      },
      Asset: {
        get: async ({ assetId }) => {
          if (assetId === emptyAsset.sys.id) {
            return emptyAsset;
          }
          if (assetId === publishedAsset.sys.id) {
            return publishedAsset;
          }
          if (assetId === changedAsset.sys.id) {
            return changedAsset;
          }
          return Promise.reject();
        },
      },
    }),
    space: {
      ...space,
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
        entity: newLink('Asset', emptyAsset.sys.id),
      }),
      openAsset: async () => {
        alert('open Asset in slide in');
        return {};
      },
      openNewEntry: async () => ({
        entity: newLink('Entry', emptyEntry.sys.id),
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
    ids: {
      space: 'space-id',
      environment: 'environment-id',
    },
  } as unknown as FieldExtensionSDK;
  return [sdk, mitt];
}
