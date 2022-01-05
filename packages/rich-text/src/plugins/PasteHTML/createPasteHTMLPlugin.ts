import { KEY_DESERIALIZE_HTML } from '@udecode/plate-core';

import { RichTextPlugin } from '../../types';
import { sanitizeHTML } from './utils/sanitizeHTML';

export const createPasteHTMLPlugin = (): RichTextPlugin => ({
  key: 'PasteHTMLPlugin',
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
