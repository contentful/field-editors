import { getEndPoint } from '../../../internal/queries';
import { getEmptyCellNode } from '../../../internal/table';
import { insertNodes, select, withoutNormalizing } from '../../../internal/transforms';
import { PlateEditor } from '../../../internal/types';
import { getInsertIndex } from '../grid';
import { isTableHeaderEnabled } from '../helpers';
import { getCurrentCell, getSlotCell, getSlotPath, setSpan } from './spanUtils';

export const canSplitCell = (editor: PlateEditor): boolean => {
  const current = getCurrentCell(editor);
  return !!current && (current.slot.colspan > 1 || current.slot.rowspan > 1);
};

/** Splits the current merged cell into 1x1 cells; content stays in the origin cell. */
export const splitCell = (editor: PlateEditor): void => {
  const current = getCurrentCell(editor);
  if (!current || !canSplitCell(editor)) return;

  const { table, tablePath, grid, slot } = current;
  const [row, col] = slot.origin;
  const headerEnabled = isTableHeaderEnabled(editor);
  const cellPath = getSlotPath(tablePath, slot);

  withoutNormalizing(editor, () => {
    // Bottom row first so row paths stay valid; positions come from the pre-split grid
    for (let r = row + slot.rowspan - 1; r >= row; r--) {
      const firstCol = r === row ? col + 1 : col;
      const count = col + slot.colspan - firstCol;
      if (count <= 0) continue;
      const header = r === 0 && headerEnabled;
      const at = [...tablePath, r, getInsertIndex(grid, r, firstCol)];
      insertNodes(
        editor,
        Array.from({ length: count }, () => getEmptyCellNode(editor, { header })),
        { at },
      );
    }

    setSpan(editor, cellPath, getSlotCell(table, slot), { colspan: 1, rowspan: 1 });

    const end = getEndPoint(editor, cellPath);
    if (end) select(editor, end);
  });
};
