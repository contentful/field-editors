import { BLOCKS } from '@contentful/rich-text-types';

import { isBlockSelected, getAncestorPathFromSelection } from '../../helpers/editor';
import { selectEditor } from '../../internal';
import {
  getBlockAbove,
  getStartPoint,
  getAboveNode,
  getChildren,
  isFirstChildPath,
  isAncestorEmpty,
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
import { insertNodes, removeNodes, moveNodes, setNodes } from '../../internal/transforms';
import { PlateEditor, NodeEntry, Ancestor, Node, Element } from '../../internal/types';
import { getMissingCellCounts, getTableGrid, GridSlot, spanData } from './grid';

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
 * The span data a cell should have: spans as placed in the grid (so colspans
 * are clamped to the table's column limit) and rowspans stopping at the last row.
 */
const canonicalSpanData = (cell: Element, slot: GridSlot, height: number) =>
  spanData(cell.data as object | undefined, {
    colspan: slot.colspan,
    rowspan: Math.min(slot.rowspan, height - slot.rowIndex),
  }) as Record<string, unknown>;

const hasCanonicalSpanData = (cell: Element, slot: GridSlot, height: number): boolean => {
  const expected = canonicalSpanData(cell, slot, height);
  const data = (cell.data ?? {}) as Record<string, unknown>;
  const keys = Object.keys(data);
  return (
    keys.length === Object.keys(expected).length && keys.every((key) => data[key] === expected[key])
  );
};

/** Cells whose span data is not canonical, with their placement in the grid */
const getNonCanonicalSpanCells = (table: Element) => {
  const grid = getTableGrid(table);
  const rows = table.children;
  const result: { cell: Element; slot: GridSlot }[] = [];
  grid.cells.forEach((rowSlots, rowIndex) =>
    rowSlots.forEach((slot, cellIndex) => {
      const cell = (rows[rowIndex] as Element).children[cellIndex] as Element;
      if (!hasCanonicalSpanData(cell, slot, grid.height)) result.push({ cell, slot });
    }),
  );
  return { grid, result };
};

/** True when every cell's span data is canonical: within the column limit and not past the last row */
export const hasValidSpans = (_: PlateEditor, [table]: NodeEntry): boolean =>
  getNonCanonicalSpanCells(table as Element).result.length === 0;

export const cleanSpans = (editor: PlateEditor, [table, tablePath]: NodeEntry): void => {
  const { grid, result } = getNonCanonicalSpanCells(table as Element);
  result.forEach(({ cell, slot }) => {
    setNodes(
      editor,
      { data: canonicalSpanData(cell, slot, grid.height) },
      { at: [...tablePath, slot.rowIndex, slot.cellIndex] },
    );
  });
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

/**
 * Table rows with fewer cells than the table width. Only real table rows are
 * considered: other children (e.g. stray text) are fixed by other normalizers
 * and can't be padded here.
 */
const getShortRows = (table: Element) => {
  const rows = table.children;
  return getMissingCellCounts(getTableGrid(table)).flatMap((missing, rowIndex) => {
    const row = rows[rowIndex];
    const isRow = isElement(row) && row.type === BLOCKS.TABLE_ROW && Array.isArray(row.children);
    return missing > 0 && isRow ? [{ rowIndex, cellCount: row.children.length, missing }] : [];
  });
};

/**
 * True when every row fills the table width. Slots covered by rowspans from
 * rows above count as filled.
 *
 * Note: We should only get different table rows cell counts in between
 * normalization cycles.
 */
export const hasNoMissingTableCells = (_: PlateEditor, [table]: NodeEntry): boolean =>
  getShortRows(table as Element).length === 0;

/** Pads every short row with empty cells, using a single grid for the whole table */
export const insertMissingTableCells = (editor: PlateEditor, [table, tablePath]: NodeEntry) => {
  getShortRows(table as Element).forEach(({ rowIndex, cellCount, missing }) => {
    insertNodes(editor, createEmptyTableCells(missing), {
      at: [...tablePath, rowIndex, cellCount],
    });
  });
};

export const isNotEmpty = (_: PlateEditor, entry: NodeEntry) => {
  return getChildren(entry).length !== 0;
};

export const isTable = (node: Node) => {
  return isElement(node) && node.type === BLOCKS.TABLE;
};
