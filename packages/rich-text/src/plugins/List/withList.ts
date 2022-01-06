import { LIST_ITEM_BLOCKS } from '@contentful/rich-text-types';
import { WithOverride } from '@udecode/plate-core';
import { withList as withDefaultList, ListPlugin } from '@udecode/plate-list';

import { getListInsertFragment } from './getListInsertFragment';

const options: ListPlugin = {
  validLiChildrenTypes: LIST_ITEM_BLOCKS,
};

export const withList: WithOverride<{}, ListPlugin> = (editor, plugin) => {
  const { insertFragment } = editor;

  withDefaultList(editor, { ...plugin, options });

  // Reverts any overrides to insertFragment
  editor.insertFragment = insertFragment;

  // Use our custom getListInsertFragment
  editor.insertFragment = getListInsertFragment(editor);

  return editor;
};
