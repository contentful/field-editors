import { INLINES } from '@contentful/rich-text-types';

import { PlatePlugin } from '../../internal/types';

export const createSelectOnBackspacePlugin = (): PlatePlugin => ({
  key: 'selectOnBackspace',
  withOverrides: (editor) => {
    const { deleteBackward } = editor;
    editor.deleteBackward = (unit) => {
      if (unit === 'character' && editor.selection && editor.api.isCollapsed()) {
        const previous = editor.api.before(editor.selection);
        const entry =
          previous && editor.api.above({ at: previous, match: { type: INLINES.EMBEDDED_ENTRY } });
        if (entry) {
          editor.tf.select(entry[1]);
          return;
        }
      }
      deleteBackward(unit);
    };
    return editor;
  },
});
