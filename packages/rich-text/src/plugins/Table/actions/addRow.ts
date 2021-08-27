import { Transforms, Path, Editor } from 'slate';
import { getAbove, insertNodes, someNode } from '@udecode/slate-plugins-common';
import { getPlatePluginType, SPEditor, TElement } from '@udecode/plate-core';
import {
  ELEMENT_TABLE,
  ELEMENT_TR,
  TablePluginOptions,
  getEmptyRowNode,
} from '@udecode/slate-plugins-table';

const addRow = (
  editor: SPEditor,
  { header }: TablePluginOptions,
  getNextRowPath: (currentRowPath: Path) => Path
) => {
  if (
    someNode(editor, {
      match: { type: getPlatePluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentRowItem = getAbove(editor, {
      match: { type: getPlatePluginType(editor, ELEMENT_TR) },
    });
    if (currentRowItem) {
      const [currentRowElem, currentRowPath] = currentRowItem;
      const nextRowPath = getNextRowPath(currentRowPath);

      insertNodes<TElement>(
        editor,
        // @ts-expect-error
        getEmptyRowNode(editor, {
          header,
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

export const addRowBelow = (editor: SPEditor, options: TablePluginOptions) => {
  addRow(editor, options, (currentRowPath) => {
    return Path.next(currentRowPath);
  });
};

export const addRowAbove = (editor: SPEditor, options: TablePluginOptions) => {
  addRow(editor, options, (currentRowPath) => {
    // The new row will be in in-place of the old row
    return currentRowPath;
  });
};
