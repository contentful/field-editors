import { BLOCKS } from '@contentful/rich-text-types';
import { getEmptyRowNode } from '@udecode/plate-table';

import { getAboveNode, someNode, getStartPoint, getNextPath } from '../../../internal/queries';
import { select, insertNodes } from '../../../internal/transforms';
import { PlateEditor, NodeEntry, Element, Path, Location } from '../../../internal/types';

const addRow = (editor: PlateEditor, getNextRowPath: (currentRowPath: Path) => Path) => {
  if (
    someNode(editor, {
      match: { type: BLOCKS.TABLE },
    })
  ) {
    const currentRowItem = getAboveNode(editor, {
      match: { type: BLOCKS.TABLE_ROW },
    }) as NodeEntry<Element> | undefined;

    if (currentRowItem) {
      const [currentRowElem, currentRowPath] = currentRowItem;
      const nextRowPath = getNextRowPath(currentRowPath);

      insertNodes(
        editor,
        getEmptyRowNode(editor, {
          header: false,
          colCount: currentRowElem.children.length,
        }),
        {
          at: nextRowPath,
          // Note: this selects the last cell of the new row
          select: true,
        }
      );

      // Select the first cell in the current row
      select(editor, getStartPoint(editor, nextRowPath as Location));
    }
  }
};

export const addRowBelow = (editor: PlateEditor) => {
  addRow(editor, (currentRowPath) => {
    return getNextPath(currentRowPath);
  });
};

export const addRowAbove = (editor: PlateEditor) => {
  addRow(editor, (currentRowPath) => {
    // The new row will be in in-place of the old row
    return currentRowPath;
  });
};
