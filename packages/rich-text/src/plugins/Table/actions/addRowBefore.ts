import { getAbove, insertNodes, someNode } from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor, TElement } from '@udecode/slate-plugins-core';
import {
  ELEMENT_TABLE,
  ELEMENT_TR,
  TablePluginOptions,
  getEmptyRowNode,
} from '@udecode/slate-plugins-table';

export const addRowBefore = (editor: SPEditor, { header }: TablePluginOptions) => {
  if (
    someNode(editor, {
      match: { type: getSlatePluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentRowItem = getAbove(editor, {
      match: { type: getSlatePluginType(editor, ELEMENT_TR) },
    });

    if (currentRowItem) {
      console.log('current row is', currentRowItem);
      const [currentRowElem, currentRowPath] = currentRowItem;
      insertNodes<TElement>(
        editor,
        // @ts-expect-error
        getEmptyRowNode(editor, {
          header,
          colCount: currentRowElem.children.length,
        }),
        {
          at: currentRowPath,
          select: true,
        }
      );
    }
  }
};
