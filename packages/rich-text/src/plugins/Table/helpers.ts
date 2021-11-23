import { Transforms, Path, Editor, Ancestor } from 'slate';
import {
  PlateEditor,
  ELEMENT_TABLE,
  ELEMENT_TH,
  ELEMENT_TD,
  ELEMENT_TR,
  insertTable,
  getAbove,
  getChildren,
  isFirstChild,
  isAncestorEmpty,
} from '@udecode/plate';
import { BLOCKS } from '@contentful/rich-text-types';

import {
  isBlockSelected,
  getNodeEntryFromSelection,
  getAncestorPathFromSelection,
} from '../../helpers/editor';
import { CustomElement } from '../../types';

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

export function insertTableAndFocusFirstCell(editor: PlateEditor): void {
  // FIXME: a table should only be allowed at root level. Currently this
  // code adds it at any level
  insertTable(editor, { header: true });
  moveToFirstCellFromSelectedTable(editor);
  replaceEmptyParagraphWithTable(editor);
}

export function isTableActive(editor: PlateEditor) {
  const tableElements = [ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR, ELEMENT_TD];
  return tableElements.some((el) => isBlockSelected(editor, el));
}

export function isTableHeaderEnabled(editor: PlateEditor) {
  const tableItem = getAbove(editor, {
    match: {
      type: BLOCKS.TABLE,
    },
  });

  if (!tableItem) {
    return false;
  }

  const firstRow = getChildren(tableItem)[0];

  if (!firstRow) {
    return false;
  }

  return getChildren(firstRow).every(([node]) => {
    return node.type === BLOCKS.TABLE_HEADER_CELL;
  });
}

export function replaceEmptyParagraphWithTable(editor: PlateEditor) {
  const tablePath = getAncestorPathFromSelection(editor);
  if (!tablePath || isFirstChild(tablePath)) return;

  const previousPath = Path.previous(tablePath);
  if (!previousPath) return;

  const [nodes] = Editor.nodes(editor, {
    at: previousPath,
    match: (node) => (node as CustomElement).type === BLOCKS.PARAGRAPH,
  });
  if (!nodes) return;

  const [previousNode] = nodes;
  const isPreviousNodeTextEmpty = isAncestorEmpty(editor, previousNode as Ancestor);
  if (isPreviousNodeTextEmpty) {
    // Switch table with previous empty paragraph
    Transforms.moveNodes(editor, { at: tablePath, to: previousPath });
    // Remove previous paragraph that now is under the table
    Transforms.removeNodes(editor, { at: tablePath });
  }
}
