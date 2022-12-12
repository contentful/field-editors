/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { LIST_ITEM_BLOCKS } from '@contentful/rich-text-types';
import { normalizeList, deleteFragmentList, deleteForwardList } from '@udecode/plate-list';

import { WithOverride } from '../../internal/types';
import { insertListBreak } from './insertListBreak';
import { insertListFragment } from './insertListFragment';
import { deleteBackwardList } from './transforms/deleteBackwardList';

const validLiChildrenTypes = LIST_ITEM_BLOCKS;

export const withList: WithOverride = (editor) => {
  const { deleteBackward, deleteForward, deleteFragment } = editor;

  editor.deleteBackward = (unit) => {
    if (deleteBackwardList(editor, unit)) return;

    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    if (deleteForwardList(editor)) return;

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
