import { KeyboardEvent } from 'react';

import { BLOCKS } from '@contentful/rich-text-types';

import { insertEmptyParagraph } from '../../helpers/editor';
import { blurEditor } from '../../internal/misc';
import { getAboveNode, getText, isFirstChild, isLastChildPath } from '../../internal/queries';
import {
  getTableEntries,
  getNextTableCell,
  getPreviousTableCell,
  onKeyDownTable as defaultKeyDownTable,
} from '../../internal/table';
import { KeyboardHandler, HotkeyPlugin, NodeEntry } from '../../internal/types';
import { addRowBelow } from './actions';

export const onKeyDownTable: KeyboardHandler<HotkeyPlugin> = (editor, plugin) => {
  const defaultHandler = defaultKeyDownTable(editor, plugin);

  return (event: KeyboardEvent) => {
    // This fixes `Cannot resolve a Slate point from DOM point:
    // [object HTMLDivElement]` when typing while the cursor is before table
    const windowSelection = window.getSelection();
    // @ts-expect-error
    // this attribute comes from `plugins/Table/components/Table.tsx`
    if (windowSelection?.anchorNode?.attributes) {
      // @ts-expect-error
      const blockType = windowSelection.anchorNode.attributes?.['data-block-type']?.value;
      const isBeforeTable = blockType === BLOCKS.TABLE;

      if (isBeforeTable) {
        if (event.key === 'Enter') {
          const above = getAboveNode(editor, { match: { type: BLOCKS.TABLE } });

          if (!above) return;

          const [, tablePath] = above;

          insertEmptyParagraph(editor, { at: tablePath, select: true });
        }

        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }

    // TODO clean this up
    if (event.key === 'Backspace') {
      const entry = getTableEntries(editor, {});

      if (entry) {
        const { table, row, cell } = entry;

        const cellText = getText(editor, cell[1]);
        const isFirstCell = isFirstChild(row[1]);
        const isFirstRow = isFirstChild(table[1]);

        if (isFirstCell && isFirstRow && !cellText) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
    }

    if (event.key === 'Tab') {
      const entry = getTableEntries(editor, {});

      if (!entry) return;
      event.preventDefault();
      const { table, row, cell } = entry;

      const isLastCell = isLastChildPath(row as NodeEntry, cell[1]);
      const isLastRow = isLastChildPath(table as NodeEntry, row[1]);

      if (!event.shiftKey && isLastRow && isLastCell) {
        addRowBelow(editor);
      } else {
        const nextCell = (event.shiftKey ? getPreviousTableCell : getNextTableCell)(
          editor,
          cell,
          cell[1],
          row,
        );
        if (nextCell) editor.tf.select(editor.api.start(nextCell[1])!);
      }
      return;
    }

    defaultHandler(event);

    if (event.key === 'Escape') {
      blurEditor(editor);
    }
  };
};
