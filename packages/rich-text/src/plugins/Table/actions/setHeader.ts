import { BLOCKS } from '@contentful/rich-text-types';

import { getAboveNode, getEntryChildren } from '../../../internal/queries';
import { setNodes } from '../../../internal/transforms';
import { PlateEditor } from '../../../internal/types';

export const setHeader = (editor: PlateEditor, enable?: boolean) => {
  const tableItem = getAboveNode(editor, {
    match: { type: BLOCKS.TABLE },
  });

  if (!tableItem) {
    return;
  }

  const firstRow = getEntryChildren(tableItem)[0];

  if (!firstRow) {
    return;
  }

  getEntryChildren(firstRow).forEach(([, path]) => {
    setNodes(
      editor,
      {
        type: enable ? BLOCKS.TABLE_HEADER_CELL : BLOCKS.TABLE_CELL,
      },
      { at: path }
    );
  });
};
