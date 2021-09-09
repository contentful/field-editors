import { Transforms } from 'slate';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { BLOCKS } from '@contentful/rich-text-types';
import {
  ELEMENT_TABLE,
  ELEMENT_TH,
  ELEMENT_TD,
  ELEMENT_TR,
  TablePluginOptions,
  getEmptyRowNode,
} from '@udecode/plate-table';
import { insertNodes, someNode, getAbove } from '@udecode/plate-common';

import { isBlockSelected, getNodeEntryFromSelection } from '../../helpers/editor';

// TODO: to be replaced with the upstream version once https://github.com/udecode/plate/pull/994
// is merged
const insertTable = (editor: SPEditor, { header }: TablePluginOptions) => {
  if (
    !someNode(editor, {
      match: { type: getPlatePluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    insertNodes<any>(editor, {
      type: getPlatePluginType(editor, ELEMENT_TABLE),
      children: [
        getEmptyRowNode(editor, { header, colCount: 2 }),
        getEmptyRowNode(editor, { header: false, colCount: 2 }),
      ],
    });
  }
};

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

export function insertTableAndFocusFirstCell(editor: SPEditor): void {
  insertTable(editor, { header: true });
  moveToFirstCellFromSelectedTable(editor);
}

export function isTableActive(editor: SPEditor) {
  const tableElements = [ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR, ELEMENT_TD];
  return tableElements.some((el) => isBlockSelected(editor, el));
}

export function isTableHeaderEnabled(editor: SPEditor) {
  const tableInfo = getAbove(editor, {
    match: {
      type: BLOCKS.TABLE,
    },
  });

  const tableNode = tableInfo?.[0];
  if (!tableNode) {
    return false;
  }

  const firstRow = tableNode.children[0];

  if (!firstRow) {
    return false;
  }

  return firstRow.children.every((node) => node.type === BLOCKS.TABLE_HEADER_CELL);
}
