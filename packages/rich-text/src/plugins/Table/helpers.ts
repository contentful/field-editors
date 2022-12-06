import { BLOCKS } from '@contentful/rich-text-types';
import {
  getParentNode,
  getAboveNode,
  getChildren,
  isFirstChild,
  isAncestorEmpty,
} from '@udecode/plate-core';
import {
  ELEMENT_TABLE,
  ELEMENT_TH,
  ELEMENT_TD,
  ELEMENT_TR,
  insertTable,
} from '@udecode/plate-table';
import { Element, Node, NodeEntry } from 'slate';
import { Transforms, Path, Editor, Ancestor } from 'slate';

import { isBlockSelected, getAncestorPathFromSelection } from '../../helpers/editor';
import { CustomElement, RichTextEditor, TextOrCustomElement } from '../../types';

export function insertTableAndFocusFirstCell(editor: RichTextEditor): void {
  insertTable(editor, { header: true });
  replaceEmptyParagraphWithTable(editor);
}

export function isTableActive(editor: RichTextEditor) {
  const tableElements = [ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR, ELEMENT_TD];
  return tableElements.some((el) => isBlockSelected(editor, el));
}

export function isTableHeaderEnabled(editor: RichTextEditor) {
  const tableItem = getAboveNode(editor, {
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

  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  const [nodes] = Editor.nodes(editor, {
    at: previousPath,
    match: (node) => (node as CustomElement).type === BLOCKS.PARAGRAPH,
  });
  if (!nodes) return;

  const [previousNode] = nodes;
  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  const isPreviousNodeTextEmpty = isAncestorEmpty(editor, previousNode as Ancestor);
  if (isPreviousNodeTextEmpty) {
    // Switch table with previous empty paragraph
    // eslint-disable-next-line -- TODO: check this
    // @ts-ignore
    Transforms.moveNodes(editor, { at: tablePath, to: previousPath });
    // Remove previous paragraph that now is under the table
    // eslint-disable-next-line -- TODO: check this
    // @ts-ignore
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
  const parent = getParentNode(editor, rowPath);

  // This is ensured by normalization. The error is here just in case
  if (!parent) {
    throw new Error('table rows must be wrapped in a table node');
  }

  const [, tablePath] = parent;

  // The longest table row determines its width
  const tableWidth = Math.max(
    // eslint-disable-next-line -- TODO: check this
    // @ts-ignore
    ...Array.from(Node.children(editor, tablePath)).map(
      // eslint-disable-next-line -- TODO: check this
      // @ts-ignore
      ([, path]) => Array.from(Node.children(editor, path)).length
    )
  );

  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
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
  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  return Array.from(Node.children(editor, path)).length !== 0;
};

export const isTable = (node: TextOrCustomElement) => {
  return Element.isElement(node) && node.type === BLOCKS.TABLE;
};
