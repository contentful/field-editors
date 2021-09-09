import { Transforms } from 'slate';
import { SPEditor } from '@udecode/plate-core';
import { BLOCKS } from '@contentful/rich-text-types';
import {
  ELEMENT_TABLE,
  ELEMENT_TH,
  ELEMENT_TD,
  ELEMENT_TR,
  insertTable,
} from '@udecode/plate-table';

import { CustomSlatePluginOptions } from '../../types';
import { isBlockSelected, getNodeEntryFromSelection } from '../../helpers/editor';

/**
 * Sets the UI focus to the first cell of the selected table.
 *
 * This is necessary because udecode's plugin sets the focus to the
 * _last_ cell of the table after selection, which is weird.
 */
function moveToFirstCellFromSelectedTable(editor) {
  const [, tablePath] = getNodeEntryFromSelection(editor, BLOCKS.TABLE);
  if (!tablePath) return;
  const firstTableCellPath = tablePath.concat([
    0, // -> row
    0, // -> cell
    0, // -> paragraph
    0, // -> text node
  ]);
  const anchor = { path: firstTableCellPath, offset: 0 };
  Transforms.setSelection(editor, { anchor, focus: anchor });
}

export function insertTableAndFocusFirstCell(
  editor: SPEditor,
  withTableOptions: CustomSlatePluginOptions
): void {
  insertTable(editor, withTableOptions);
  moveToFirstCellFromSelectedTable(editor);
}

export function isTableActive(editor: SPEditor) {
  const tableElements = [ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR, ELEMENT_TD];
  return tableElements.some((el) => isBlockSelected(editor, el));
}
