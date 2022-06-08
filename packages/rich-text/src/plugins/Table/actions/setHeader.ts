import { BLOCKS } from '@contentful/rich-text-types';
import { PlateEditor, getAbove, setNodes, getChildren } from '@udecode/plate-core';

export const setHeader = (editor: PlateEditor, enable?: boolean) => {
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
};
