import { BLOCKS } from '@contentful/rich-text-types';

import { getAboveNode, getChildren } from '../../../internal/queries';
import { setNodes } from '../../../internal/transforms';
import { PlateEditor } from '../../../internal/types';

export const setHeader = (editor: PlateEditor, enable?: boolean) => {
  const tableItem = getAboveNode(editor, {
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
