import { BLOCKS } from '@contentful/rich-text-types';

import {
  getAboveNode,
  getEndPoint,
  getNodeEntry,
  isElement,
  isText,
} from '../../../internal/queries';
import {
  moveNodes,
  removeNodes,
  select,
  setNodes,
  withoutNormalizing,
} from '../../../internal/transforms';
import { Element, Path, PlateEditor } from '../../../internal/types';
import { GridSlot, TableGrid, getCellSlot, getTableGrid, spanData } from '../grid';
import { isTableHeaderEnabled } from '../helpers';

/** A block of cells in grid coordinates */
export type CellRect = { row: number; col: number; rowspan: number; colspan: number };

type CurrentCell = { tablePath: Path; grid: TableGrid; slot: GridSlot };

const isEmptyCell = (cell: Element): boolean => {
  if (cell.children.length !== 1) return false;
  const [child] = cell.children;
  return (
    isElement(child) &&
    child.type === BLOCKS.PARAGRAPH &&
    child.children.length === 1 &&
    isText(child.children[0]) &&
    child.children[0].text === ''
  );
};

const cellPath = (tablePath: Path, slot: GridSlot): Path => [
  ...tablePath,
  slot.rowIndex,
  slot.cellIndex,
];

/**
 * Merges every cell inside `rect` into the cell at its top-left corner.
 * The caller guarantees that no cell sticks out of `rect`.
 */
export function mergeCellBlock(editor: PlateEditor, tablePath: Path, rect: CellRect): void {
  const [table] = getNodeEntry(editor, tablePath) as [Element, Path];
  const grid = getTableGrid(table);

  // Unique cells inside the rect, in reading order
  const slots: GridSlot[] = [];
  for (let r = rect.row; r < rect.row + rect.rowspan; r++) {
    for (let c = rect.col; c < rect.col + rect.colspan; c++) {
      const slot = grid.slots[r]?.[c];
      if (slot && !slots.includes(slot)) slots.push(slot);
    }
  }

  const [target, ...others] = slots;
  if (!target) return;

  const targetPath = cellPath(tablePath, target);
  const cellAt = (slot: GridSlot) =>
    (table.children[slot.rowIndex] as Element).children[slot.cellIndex] as Element;
  const targetWasEmpty = isEmptyCell(cellAt(target));

  withoutNormalizing(editor, () => {
    // The target precedes every other cell in document order, so moving
    // content out of the others never shifts the target's or their paths.
    let targetLength = cellAt(target).children.length;
    let received = false;
    for (const slot of others) {
      const cell = cellAt(slot);
      if (isEmptyCell(cell)) continue;
      const fromPath = cellPath(tablePath, slot);
      for (let i = 0; i < cell.children.length; i++) {
        moveNodes(editor, { at: [...fromPath, 0], to: [...targetPath, targetLength++] });
      }
      received = true;
    }

    // Bottom row first, rightmost cell first, so earlier paths stay valid
    [...others]
      .sort((a, b) => b.rowIndex - a.rowIndex || b.cellIndex - a.cellIndex)
      .forEach((slot) => removeNodes(editor, { at: cellPath(tablePath, slot) }));

    setNodes(
      editor,
      {
        data: spanData(cellAt(target).data as object | undefined, {
          colspan: rect.colspan,
          rowspan: rect.rowspan,
        }),
      },
      { at: targetPath },
    );

    if (targetWasEmpty && received) {
      removeNodes(editor, { at: [...targetPath, 0] });
    }

    const end = getEndPoint(editor, targetPath);
    if (end) select(editor, end);
  });
}

const getCurrentCell = (editor: PlateEditor): CurrentCell | undefined => {
  const cellEntry = getAboveNode(editor, {
    match: { type: [BLOCKS.TABLE_CELL, BLOCKS.TABLE_HEADER_CELL] },
  });
  const tableEntry = getAboveNode(editor, { match: { type: BLOCKS.TABLE } });
  if (!cellEntry || !tableEntry) return undefined;

  const [, path] = cellEntry;
  const [table, tablePath] = tableEntry;
  if (path.length !== tablePath.length + 2) return undefined;

  const grid = getTableGrid(table as Element);
  const slot = getCellSlot(grid, path[path.length - 2], path[path.length - 1]);
  return { tablePath, grid, slot };
};

const getRightNeighbour = ({ grid, slot }: CurrentCell): GridSlot | undefined => {
  const [row, col] = slot.origin;
  const neighbour = grid.slots[row]?.[col + slot.colspan];
  if (!neighbour || neighbour.origin[0] !== row || neighbour.rowspan !== slot.rowspan) {
    return undefined;
  }
  return neighbour;
};

// Merging a header-row cell down into the body is not allowed
const getDownNeighbour = (
  editor: PlateEditor,
  { grid, slot }: CurrentCell,
): GridSlot | undefined => {
  const [row, col] = slot.origin;
  if (row === 0 && isTableHeaderEnabled(editor)) return undefined;
  const neighbour = grid.slots[row + slot.rowspan]?.[col];
  if (!neighbour || neighbour.origin[1] !== col || neighbour.colspan !== slot.colspan) {
    return undefined;
  }
  return neighbour;
};

export const canMergeRight = (editor: PlateEditor): boolean => {
  const current = getCurrentCell(editor);
  return !!current && !!getRightNeighbour(current);
};

export const canMergeDown = (editor: PlateEditor): boolean => {
  const current = getCurrentCell(editor);
  return !!current && !!getDownNeighbour(editor, current);
};

export const mergeCellRight = (editor: PlateEditor): void => {
  const current = getCurrentCell(editor);
  const neighbour = current && getRightNeighbour(current);
  if (!current || !neighbour) return;

  const { slot } = current;
  mergeCellBlock(editor, current.tablePath, {
    row: slot.origin[0],
    col: slot.origin[1],
    rowspan: slot.rowspan,
    colspan: slot.colspan + neighbour.colspan,
  });
};

export const mergeCellDown = (editor: PlateEditor): void => {
  const current = getCurrentCell(editor);
  const neighbour = current && getDownNeighbour(editor, current);
  if (!current || !neighbour) return;

  const { slot } = current;
  mergeCellBlock(editor, current.tablePath, {
    row: slot.origin[0],
    col: slot.origin[1],
    rowspan: slot.rowspan + neighbour.rowspan,
    colspan: slot.colspan,
  });
};
