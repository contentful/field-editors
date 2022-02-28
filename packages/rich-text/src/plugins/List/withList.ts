/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { LIST_ITEM_BLOCKS } from '@contentful/rich-text-types';
import { WithOverride } from '@udecode/plate-core';
import {
  ListPlugin,
  normalizeList,
  deleteFragmentList,
  deleteForwardList,
  deleteBackwardList,
} from '@udecode/plate-list';

import { RichTextEditor } from '../../types';
import { insertListBreak } from './insertListBreak';
import { insertListFragment } from './insertListFragment';

const validLiChildrenTypes = LIST_ITEM_BLOCKS;

export const withList: WithOverride<RichTextEditor, ListPlugin> = (editor) => {
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

  // TODO: replace with Normalizer rules
  editor.normalizeNode = normalizeList(editor, { validLiChildrenTypes });

  return editor;
};
