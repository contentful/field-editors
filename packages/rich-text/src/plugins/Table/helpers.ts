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
import { insertNodes, removeNodes, moveNodes, setNodes } from '../../internal/transforms';
import { PlateEditor, NodeEntry, Ancestor, Node, Element } from '../../internal/types';
import { getSpan, getTableGrid, spanData } from './grid';

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

  const grid = getTableGrid(parent[0] as Element);
  const rowIndex = rowPath[rowPath.length - 1];
  // Slots include those covered by rowspans from rows above
  const occupied = grid.slots[rowIndex].filter(Boolean).length;

  return grid.width - occupied;
};

const hasCleanSpanData = (cell: Element, maxRowspan: number): boolean => {
  const span = getSpan(cell);
  const expected = spanData(cell.data as object | undefined, {
    colspan: span.colspan,
    rowspan: Math.min(span.rowspan, maxRowspan),
  });
  const data = (cell.data ?? {}) as Record<string, unknown>;
  const keys = Object.keys(data);
  return (
    keys.length === Object.keys(expected).length &&
    keys.every((key) => data[key] === (expected as Record<string, unknown>)[key])
  );
};

/** True when every cell's span data is canonical and no rowspan passes the last row */
export const hasValidSpans = (_: PlateEditor, [table]: NodeEntry): boolean => {
  const rows = (table as Element).children as Element[];
  return rows.every((row, rowIndex) =>
    (row.children as Element[]).every((cell) => hasCleanSpanData(cell, rows.length - rowIndex)),
  );
};

export const cleanSpans = (editor: PlateEditor, [table, tablePath]: NodeEntry): void => {
  const rows = (table as Element).children as Element[];
  rows.forEach((row, rowIndex) => {
    (row.children as Element[]).forEach((cell, cellIndex) => {
      if (hasCleanSpanData(cell, rows.length - rowIndex)) return;
      const span = getSpan(cell);
      setNodes(
        editor,
        {
          data: spanData(cell.data as object | undefined, {
            colspan: span.colspan,
            rowspan: Math.min(span.rowspan, rows.length - rowIndex),
          }),
        },
        { at: [...tablePath, rowIndex, cellIndex] },
      );
    });
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

export const isNotEmpty = (_: PlateEditor, entry: NodeEntry) => {
  return getChildren(entry).length !== 0;
};

export const isTable = (node: Node) => {
  return isElement(node) && node.type === BLOCKS.TABLE;
};
