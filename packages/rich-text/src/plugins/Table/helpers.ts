import { BLOCKS } from '@contentful/rich-text-types';
import { getParent } from '@udecode/plate-core';
import { getAbove, getChildren, isFirstChild, isAncestorEmpty } from '@udecode/plate-core';
import {
  ELEMENT_TABLE,
  ELEMENT_TH,
  ELEMENT_TD,
  ELEMENT_TR,
  insertTable,
} from '@udecode/plate-table';
import { Node, NodeEntry } from 'slate';
import { Transforms, Path, Editor, Ancestor } from 'slate';

import { isBlockSelected, getAncestorPathFromSelection } from '../../helpers/editor';
import { CustomElement, RichTextEditor } from '../../types';

export function insertTableAndFocusFirstCell(editor: RichTextEditor): void {
  insertTable(editor, { header: true });
  replaceEmptyParagraphWithTable(editor);
}

export function isTableActive(editor: RichTextEditor) {
  const tableElements = [ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR, ELEMENT_TD];
  return tableElements.some((el) => isBlockSelected(editor, el));
}

export function isTableHeaderEnabled(editor: RichTextEditor) {
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

export function replaceEmptyParagraphWithTable(editor: RichTextEditor) {
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

/**
 * Returns the number of cells in a given row vs the table width
 *
 * Note: We should only get different table rows cell counts in between
 * normalization cycles.
 */
export const getNoOfMissingTableCellsInRow = (editor: RichTextEditor, [, rowPath]: NodeEntry) => {
  const parent = getParent(editor, rowPath);

  // This is ensured by normalization. The error is here just in case
  if (!parent) {
    throw new Error('table rows must be wrapped in a table node');
  }

  const [, tablePath] = parent;

  // The longest table row determines its width
  const tableWidth = Math.max(
    ...Array.from(Node.children(editor, tablePath)).map(
      ([, path]) => Array.from(Node.children(editor, path)).length
    )
  );

  const rowWidth = Array.from(Node.children(editor, rowPath)).length;

  return tableWidth - rowWidth;
};

export const createEmptyTableCells = (count: number): Node[] => {
  const emptyTableCell = {
    type: BLOCKS.TABLE_CELL,
    data: {},
    children: [
      {
        type: BLOCKS.PARAGRAPH,
        data: {},
        children: [{ text: '' }],
      },
    ],
  };

  return new Array(count).fill(emptyTableCell);
};

export const isNotEmpty = (editor: RichTextEditor, [, path]: NodeEntry) => {
  return Array.from(Node.children(editor, path)).length !== 0;
};
