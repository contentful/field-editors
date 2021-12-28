import { WithOverride } from '@udecode/plate-core';
import { withList as withDefaultList, ListPlugin } from '@udecode/plate-list';

import { getListInsertFragment } from './getListInsertFragment';

export const withList: WithOverride<{}, ListPlugin> = (editor, plugin) => {
  const { insertFragment } = editor;

  withDefaultList(editor, plugin);

  // Reverts any overrides to insertFragment
  editor.insertFragment = insertFragment;

  // Use our custom getListInsertFragment
  editor.insertFragment = getListInsertFragment(editor);

  return editor;
};
