import { KEY_DESERIALIZE_HTML } from '@udecode/plate-common';

import { PlatePlugin } from '../../internal/types';
import { sanitizeHTML } from './utils/sanitizeHTML';

/**
 * Get x-slate-fragment attribute from data-slate-fragment
 */
const catchSlateFragment = /data-slate-fragment="(.+?)"/m;
export const getSlateFragmentAttribute = (dataTransfer: DataTransfer): string | void => {
  const htmlData = dataTransfer.getData('text/html');
  const [, fragment] = htmlData.match(catchSlateFragment) || [];
  return fragment;
};

/**
 * Get the x-slate-fragment attribute that exist in text/html data
 * and append it to the DataTransfer object
 */
export const ensureXSlateFragment = (dataTransfer: DataTransfer): DataTransfer => {
  if (!dataTransfer.getData('application/x-slate-fragment')) {
    const fragment = getSlateFragmentAttribute(dataTransfer);
    if (fragment) {
      const clipboardData = new DataTransfer();
      dataTransfer.types.forEach((type) => {
        clipboardData.setData(type, dataTransfer.getData(type));
      });
      clipboardData.setData('application/x-slate-fragment', fragment);
      return clipboardData;
    }
  }
  return dataTransfer;
};

export const createPasteHTMLPlugin = (): PlatePlugin => ({
  key: 'PasteHTMLPlugin',
  withOverrides: (editor) => {
    const { insertData } = editor;
    editor.insertData = (data) => insertData(ensureXSlateFragment(data));
    return editor;
  },
  inject: {
    pluginsByKey: {
      [KEY_DESERIALIZE_HTML]: {
        editor: {
          insertData: {
            format: 'text/html',
            // Perform custom content transformation *before* pasting
            transformData: sanitizeHTML,
          },
        },
      },
    },
  },
});
