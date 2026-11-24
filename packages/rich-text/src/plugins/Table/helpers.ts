import { BLOCKS } from '@contentful/rich-text-types';

import {
  isBlockSelected,
  getAncestorPathFromSelection,
  getNodeEntryFromSelection,
} from '../../helpers/editor';
import { selectEditor } from '../../internal';
import {
  getBlockAbove,
  getStartPoint,
  getAboveNode,
  getChildren,
  isFirstChildPath,
  isAncestorEmpty,
  getParentNode,
  isElement,
  getNodeEntries,
  getPreviousPath,
} from '../../internal/queries';
import {
  ELEMENT_TABLE,
  ELEMENT_TH,
  ELEMENT_TD,
  ELEMENT_TR,
  getEmptyRowNode,
} from '../../internal/table';
import { insertNodes, removeNodes, moveNodes } from '../../internal/transforms';
import { PlateEditor, NodeEntry, Ancestor, Node } from '../../internal/types';

export function insertTableAndFocusFirstCell(editor: PlateEditor): void {
  const table = {
    type: BLOCKS.TABLE,
    data: {},
    children: [
      getEmptyRowNode(editor, { colCount: 2, header: true }),
      getEmptyRowNode(editor, { colCount: 2 }),
    ],
  };

  insertNodes(editor, table);

  if (editor.selection) {
    const tableEntry = getBlockAbove(editor, {
      match: { type: BLOCKS.TABLE },
    });
    if (!tableEntry) return;

    selectEditor(editor, { at: getStartPoint(editor, tableEntry[1]) });
  }

  replaceEmptyParagraphWithTable(editor);
}

export function isTableActive(editor: PlateEditor) {
  const tableElements = [ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR, ELEMENT_TD];
  return tableElements.some((el) => isBlockSelected(editor, el));
}

export function isTableHeaderEnabled(editor: PlateEditor) {
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

/**
 * Whether any node below the given node (for example a table row) is an embedded asset block.
 */
export function hasEmbeddedAsset(node: Node): boolean {
  const children = (node as Ancestor).children ?? [];

  return children.some(
    (child) => (child as Node).type === BLOCKS.EMBEDDED_ASSET || hasEmbeddedAsset(child as Node),
  );
}

/**
 * Whether the first row of the table around the selection contains an embedded asset,
 * in which case it cannot be turned into a table header.
 */
export function isTableHeaderBlockedByAssets(editor: PlateEditor): boolean {
  const tableItem = getAboveNode(editor, { match: { type: BLOCKS.TABLE } });
  const firstRow = tableItem && getChildren(tableItem)[0];

  return !!firstRow && hasEmbeddedAsset(firstRow[0]);
}

/**
 * Table header cells only accept paragraphs, so embedded assets in a fragment
 * that is about to be inserted in one are left out.
 */
export function withoutAssetsInTableHeader<N extends Node>(
  editor: PlateEditor,
  fragment: N[],
): N[] {
  // The fragment replaces the whole selection, so either end in a header cell counts
  const selection = editor.selection;
  const isInHeader = selection
    ? [selection.anchor.path, selection.focus.path].some(
        (path) => getNodeEntryFromSelection(editor, BLOCKS.TABLE_HEADER_CELL, path)[0],
      )
    : false;

  if (!isInHeader) {
    return fragment;
  }

  return fragment.filter((node) => node.type !== BLOCKS.EMBEDDED_ASSET);
}

export function replaceEmptyParagraphWithTable(editor: PlateEditor) {
  const tablePath = getAncestorPathFromSelection(editor);
  if (!tablePath || isFirstChildPath(tablePath)) return;

  const previousPath = getPreviousPath(tablePath);
  if (!previousPath) return;

  const [nodes] = getNodeEntries(editor, {
    at: previousPath,
    match: (node) => node.type === BLOCKS.PARAGRAPH,
  });
  if (!nodes) return;

  const [previousNode] = nodes;
  const isPreviousNodeTextEmpty = isAncestorEmpty(editor, previousNode as Ancestor);
  if (isPreviousNodeTextEmpty) {
    // Switch table with previous empty paragraph
    moveNodes(editor, { at: tablePath, to: previousPath });
    // Remove previous paragraph that now is under the table
    removeNodes(editor, { at: tablePath });
  }
}

/**
 * Returns the number of cells in a given row vs the table width
 *
 * Note: We should only get different table rows cell counts in between
 * normalization cycles.
 */
export const getNoOfMissingTableCellsInRow = (editor: PlateEditor, rowEntry: NodeEntry) => {
  const [, rowPath] = rowEntry;
  const parent = getParentNode(editor, rowPath);

  // This is ensured by normalization. The error is here just in case
  if (!parent) {
    throw new Error('table rows must be wrapped in a table node');
  }

  // The longest table row determines its width
  const tableWidth = Math.max(...getChildren(parent).map((entry) => getChildren(entry).length));

  const rowWidth = getChildren(rowEntry).length;

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

export const isNotEmpty = (_: PlateEditor, entry: NodeEntry) => {
  return getChildren(entry).length !== 0;
};

export const isTable = (node: Node) => {
  return isElement(node) && node.type === BLOCKS.TABLE;
};
