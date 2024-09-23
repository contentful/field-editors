/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { LIST_ITEM_BLOCKS } from '@contentful/rich-text-types';
import { normalizeList, deleteFragmentList, deleteForwardList } from '@udecode/plate-list';

import { WithOverride } from '../../internal/types';
import { insertListBreak } from './insertListBreak';
import { insertListFragment } from './insertListFragment';

const validLiChildrenTypes = LIST_ITEM_BLOCKS;

export const withList: WithOverride = (editor) => {
  const { deleteForward, deleteFragment } = editor;

  editor.deleteForward = (unit) => {
    if (deleteForwardList(editor, deleteForward, unit)) return;

    deleteForward(unit);
  };

  editor.deleteFragment = () => {
    if (deleteFragmentList(editor)) return;

    deleteFragment();
  };

  editor.insertBreak = insertListBreak(editor);

  editor.insertFragment = insertListFragment(editor);

  // TODO: replace with our own Normalizer rules
  editor.normalizeNode = normalizeList(editor, { validLiChildrenTypes });

  return editor;
};
