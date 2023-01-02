import { KeyboardEvent } from 'react';

import { BLOCKS } from '@contentful/rich-text-types';
import {
  HotkeyPlugin,
  KeyboardHandler,
  WithPlatePlugin,
  getAbove,
  isLastChild,
} from '@udecode/plate-core';
import { getTableCellEntry, onKeyDownTable as defaultKeyDownTable } from '@udecode/plate-table';
import { ReactEditor } from 'slate-react';

import { insertEmptyParagraph } from '../../helpers/editor';
import { RichTextEditor } from '../../types';
import { addRowBelow } from './actions';

export const onKeyDownTable: KeyboardHandler<RichTextEditor, HotkeyPlugin> = (editor, plugin) => {
  const defaultHandler = defaultKeyDownTable(editor, plugin as WithPlatePlugin);

  return (event: KeyboardEvent) => {
    // This fixes `Cannot resolve a Slate point from DOM point: [object HTMLDivElement]` when typing while the cursor is before table
    const windowSelection = window.getSelection();
    if (windowSelection) {
      // @ts-expect-error
      const blockType = windowSelection.anchorNode.attributes?.['data-block-type']?.value; // this attribute comes from `plugins/Table/components/Table.tsx`
      const isBeforeTable = blockType === BLOCKS.TABLE;

      if (isBeforeTable) {
        if (event.key === 'Enter') {
          const above = getAbove(editor, { match: { type: BLOCKS.TABLE } });

          if (!above) return;

          const [, tablePath] = above;

          insertEmptyParagraph(editor, { at: tablePath, select: true });
        }

        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }

    // Pressing Tab on the last cell creates a new row
    // Otherwise, jumping between cells is handled in the defaultKeyDownTable
    if (event.key === 'Tab' && !event.shiftKey) {
      const res = getTableCellEntry(editor, {});

      if (res) {
        event.preventDefault();
        const { tableElement, tableRow, tableCell } = res;

        const isLastCell = isLastChild(tableRow, tableCell[1]);
        const isLastRow = isLastChild(tableElement, tableRow[1]);

        if (isLastRow && isLastCell) {
          addRowBelow(editor);

          // skip default handler
          return;
        } else {
          defaultHandler(event);
        }
      }
    }

    if (event.key === 'Escape') {
      ReactEditor.blur(editor);
    }
  };
};
