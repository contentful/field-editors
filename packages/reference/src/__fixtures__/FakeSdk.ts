import {
  createFakeFieldAPI,
  createFakeLocalesAPI,
  createFakeSpaceAPI,
} from '@contentful/field-editor-test-utils';
import { FieldAPI, Link } from '@contentful/app-sdk';
import emptyEntry from './empty_entry.json';
import publishedEntry from './published_entry.json';
import changedEntry from './changed_entry.json';
import emptyAsset from './empty_asset.json';
import publishedAsset from './published_asset.json';
import changedAsset from './changed_asset.json';

const newLink = (linkType: string, id: string): Link => ({
  sys: {
    id,
    linkType,
    type: 'Link',
  },
});
export function newReferenceEditorFakeSdk() {
  const rawInitialValue = window.localStorage.getItem('initialValue');
  const initialValue = rawInitialValue ? JSON.parse(rawInitialValue) : undefined;
  const rawValidations = window.localStorage.getItem('fieldValidations');
  const validations = rawValidations ? JSON.parse(rawValidations) : undefined;
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
    space: {
      ...space,
      getAsset: async (id: string) => {
        if (id === emptyAsset.sys.id) {
          return emptyAsset;
        }
        if (id === publishedAsset.sys.id) {
          return publishedAsset;
        }
        if (id === changedAsset.sys.id) {
          return changedAsset;
        }
        return Promise.reject();
      },
      getEntry: async (id: string) => {
        if (id === emptyEntry.sys.id) {
          return emptyEntry;
        }
        if (id === publishedEntry.sys.id) {
          return publishedEntry;
        }
        if (id === changedEntry.sys.id) {
          return changedEntry;
        }
        return Promise.reject();
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
  };
  return [sdk, mitt];
}
