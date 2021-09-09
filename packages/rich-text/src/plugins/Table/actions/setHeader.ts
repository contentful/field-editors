import { SPEditor } from '@udecode/plate-core';
import { BLOCKS } from '@contentful/rich-text-types';
import { getAbove, setNodes, someNode, getChildren } from '@udecode/plate-common';

export const setHeader = (editor: SPEditor, enable?: boolean) => {
  if (
    someNode(editor, {
      match: { type: BLOCKS.TABLE },
    })
  ) {
    const tableItem = getAbove(editor, {
      match: { type: BLOCKS.TABLE },
    });

    if (!tableItem) {
      return;
    }

    const firstRow = getChildren(tableItem)[0];

    if (!firstRow) {
      return;
    }

    getChildren(firstRow).forEach(([, path]) => {
      setNodes(
        editor,
        {
          type: enable ? BLOCKS.TABLE_HEADER_CELL : BLOCKS.TABLE_CELL,
        },
        { at: path }
      );
    });
  }
};
