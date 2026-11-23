import { BLOCKS } from '@contentful/rich-text-types';

import { getAboveNode, getChildren } from '../../../internal/queries';
import { setNodes } from '../../../internal/transforms';
import { PlateEditor } from '../../../internal/types';
import { hasEmbeddedAsset } from '../helpers';

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

  // Header cells only accept paragraphs, so a row with assets cannot become the header row
  if (enable && hasEmbeddedAsset(firstRow[0])) {
    return;
  }

  getChildren(firstRow).forEach(([, path]) => {
    setNodes(
      editor,
      {
        type: enable ? BLOCKS.TABLE_HEADER_CELL : BLOCKS.TABLE_CELL,
      },
      { at: path },
    );
  });
};
