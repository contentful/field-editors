// @ts-nocheck
import { getPluginType, TElement, getAboveNode, insertNodes, someNode } from '@udecode/plate-core';
import { ELEMENT_TABLE, ELEMENT_TR, getEmptyRowNode } from '@udecode/plate-table';
import { Transforms, Path, Editor } from 'slate';

import { RichTextEditor } from '../../../types';

const addRow = (editor: RichTextEditor, getNextRowPath: (currentRowPath: Path) => Path) => {
  if (
    someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentRowItem = getAboveNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TR) },
    });

    if (currentRowItem) {
      const [currentRowElem, currentRowPath] = currentRowItem;
      const nextRowPath = getNextRowPath(currentRowPath);

      insertNodes<TElement>(
        editor,
        // @ts-expect-error
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
      Transforms.select(editor, Editor.start(editor, nextRowPath));
    }
  }
};

export const addRowBelow = (editor: RichTextEditor) => {
  addRow(editor, (currentRowPath) => {
    return Path.next(currentRowPath);
  });
};

export const addRowAbove = (editor: RichTextEditor) => {
  addRow(editor, (currentRowPath) => {
    // The new row will be in in-place of the old row
    return currentRowPath;
  });
};
