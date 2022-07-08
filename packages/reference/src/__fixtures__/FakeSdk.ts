import { FieldAPI, Link } from '@contentful/app-sdk';
import {
  createFakeFieldAPI,
  createFakeLocalesAPI,
  createFakeSpaceAPI,
} from '@contentful/field-editor-test-utils';
import { Adapter, MRActions, MROpts } from 'contentful-management';
import { Except, PartialDeep } from 'type-fest';

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

type Options<ET extends keyof MRActions, A extends keyof MRActions[ET]> = Except<
  MROpts<ET, A>,
  'entityType' | 'action'
>;
type Params<ET extends keyof MRActions, A extends keyof MRActions[ET]> =
  'params' extends keyof Options<ET, A> ? Options<ET, A>['params'] : {};
type Return<ET extends keyof MRActions, Action extends keyof MRActions[ET]> =
  'return' extends keyof MRActions[ET][Action]
    ? Promise<PartialDeep<MRActions[ET][Action]['return']>>
    : never;

type Overrides = PartialDeep<
  {
    [EntityType in keyof MRActions]: {
      [Action in keyof MRActions[EntityType]]: (
        params: Params<EntityType, Action>
      ) => Return<EntityType, Action>;
    };
  }
>;

function createFakeAdapter(overrides?: Overrides) {
  const makeRequest: Adapter['makeRequest'] = ({ entityType, action, params }) => {
    return (
      // @ts-expect-error
      overrides?.[entityType]?.[action]?.(params) ??
      Promise.reject(`Override for ${entityType}.${action} is not defined`)
    );
  };

  return { makeRequest };
}

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
    cmaAdapter: createFakeAdapter({
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
  };
  return [sdk, mitt];
}

export function newResourceEditorFakeSdk() {
  const initialValue = [
    {
      sys: {
        type: 'ResourceLink',
        linkType: 'Contentful:Entry',
        urn: 'crn:contentful:::content:spaces/zi1t1h18x6dz/entries/a1b2c3',
      },
    },
    {
      sys: {
        type: 'ResourceLink',
        linkType: 'Contentful:Entry',
        urn: 'crn:contentful:::content:spaces/zi1t1h18x6dz/entries/x1y2z3',
      },
    },
  ];

  const [field, mitt] = createFakeFieldAPI(undefined, initialValue);
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
    cmaAdapter: {
      makeRequest: () => Promise.resolve({}),
    },
    field,
    locales,
    space: {
      ...space,
      getAsset: async () => {
        return Promise.reject();
      },
      getEntry: async () => {
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
