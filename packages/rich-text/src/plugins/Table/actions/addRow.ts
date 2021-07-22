import { Transforms, Path, Editor } from 'slate';
import { getAbove, insertNodes, someNode } from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor, TElement } from '@udecode/slate-plugins-core';
import {
  ELEMENT_TABLE,
  ELEMENT_TR,
  TablePluginOptions,
  getEmptyRowNode,
} from '@udecode/slate-plugins-table';

const addRow = (editor: SPEditor, { header }: TablePluginOptions, nextRowPath: Path) => {
  if (
    someNode(editor, {
      match: { type: getSlatePluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentRowItem = getAbove(editor, {
      match: { type: getSlatePluginType(editor, ELEMENT_TR) },
    });
    if (currentRowItem) {
      const currentRowElem = currentRowItem[0];

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

export const addRowBelow = (editor: SPEditor, { header }: TablePluginOptions) => {
  const currentRowItem = getAbove(editor, {
    match: { type: getSlatePluginType(editor, ELEMENT_TR) },
  });

  if (currentRowItem) {
    const currentRowPath = currentRowItem[1];
    const nextRowPath = Path.next(currentRowPath);
    addRow(editor, { header }, nextRowPath);
  }
};

export const addRowAbove = (editor: SPEditor, { header }: TablePluginOptions) => {
  const currentRowItem = getAbove(editor, {
    match: { type: getSlatePluginType(editor, ELEMENT_TR) },
  });

  if (currentRowItem) {
    const nextRowPath = currentRowItem[1];
    addRow(editor, { header }, nextRowPath);
  }
};
