import { BLOCKS } from '@contentful/rich-text-types';

import { getEndPoint, getNodeEntry } from '../../../internal/queries';
import { insertNodes, select, setNodes, withoutNormalizing } from '../../../internal/transforms';
import { Element, PlateEditor } from '../../../internal/types';
import { getInsertIndex, spanData } from '../grid';
import { isTableHeaderEnabled } from '../helpers';
import { getCurrentCell } from './mergeCells';

export const canSplitCell = (editor: PlateEditor): boolean => {
  const current = getCurrentCell(editor);
  return !!current && (current.slot.colspan > 1 || current.slot.rowspan > 1);
};

const createEmptyCell = (type: string): Element =>
  ({
    type,
    data: {},
    children: [{ type: BLOCKS.PARAGRAPH, data: {}, children: [{ text: '' }] }],
  }) as Element;

/** Splits the current merged cell into 1x1 cells; content stays in the origin cell. */
export const splitCell = (editor: PlateEditor): void => {
  const current = getCurrentCell(editor);
  if (!current || !canSplitCell(editor)) return;

  const { tablePath, grid, slot } = current;
  const [row, col] = slot.origin;
  const headerEnabled = isTableHeaderEnabled(editor);
  const cellPath = [...tablePath, slot.rowIndex, slot.cellIndex];
  const [cell] = getNodeEntry(editor, cellPath) as [Element, unknown];

  withoutNormalizing(editor, () => {
    // Bottom row first so row paths stay valid; positions come from the pre-split grid
    for (let r = row + slot.rowspan - 1; r >= row; r--) {
      const firstCol = r === row ? col + 1 : col;
      const count = col + slot.colspan - firstCol;
      if (count <= 0) continue;
      const type = r === 0 && headerEnabled ? BLOCKS.TABLE_HEADER_CELL : BLOCKS.TABLE_CELL;
      const at = [...tablePath, r, getInsertIndex(grid, r, firstCol)];
      insertNodes(
        editor,
        Array.from({ length: count }, () => createEmptyCell(type)),
        { at },
      );
    }

    setNodes(
      editor,
      { data: spanData(cell.data as object | undefined, { colspan: 1, rowspan: 1 }) },
      { at: cellPath },
    );

    const end = getEndPoint(editor, cellPath);
    if (end) select(editor, end);
  });
};
