import {
  createFakeFieldAPI,
  createFakeLocalesAPI,
  createFakeSpaceAPI,
} from '@contentful/field-editor-test-utils';
import emptyEntry from './empty_entry.json';
import publishedEntry from './published_entry.json';
import changedEntry from './changed_entry.json';

export function newReferenceEditorFakeSdk() {
  const initialValue = window.localStorage.getItem('initialValue');
  const [field, mitt] = createFakeFieldAPI((field) => field, initialValue);
  const space = createFakeSpaceAPI();
  const locales = createFakeLocalesAPI();
  const links = [
    {
      sys: {
        id: 'published_entry',
      },
    },
    {
      sys: {
        id: 'changed_entry',
      },
    },
    {
      sys: {
        id: 'empty_entry',
      },
    },
  ];
  let selectorCounter = 0;
  const sdk = {
    field,
    locales,
    space: {
      ...space,
      getEntry: async (id: string) => {
        if (id === 'empty_entry') {
          return emptyEntry;
        }
        if (id === 'published_entry') {
          return publishedEntry;
        }
        if (id === 'changed_entry') {
          return changedEntry;
        }
        return Promise.reject();
      },
      async getEntityScheduledActions() {
        return [];
      },
    },
    dialogs: {
      selectSingleEntry: () => {
        selectorCounter++;
        return links[selectorCounter % links.length];
      },
      selectMultipleEntries: () => {
        selectorCounter++;
        return selectorCounter % 2 ? links.slice(0, 2) : [links[2]];
      },
    },
    navigator: {
      openNewEntry: async () => ({
        entity: {
          sys: {
            id: 'empty_entry',
          },
        },
      }),
      openEntry: async () => {
        alert('open entry in slide in');
        return {};
      },
      onSlideInNavigation: () => () => ({}),
    },
  };
  return [sdk, mitt];
}
