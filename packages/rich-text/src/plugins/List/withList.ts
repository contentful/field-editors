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
} from '@udecode/plate-list';

import { RichTextEditor } from '../../types';
import { insertListBreak } from './insertListBreak';
import { insertListFragment } from './insertListFragment';
import { deleteBackwardList } from './transforms/deleteBackwardList';

const validLiChildrenTypes = LIST_ITEM_BLOCKS;

// eslint-disable-next-line -- TODO: check this
// @ts-ignore
export const withList: WithOverride<RichTextEditor, ListPlugin> = (editor) => {
  const { deleteBackward, deleteForward, deleteFragment } = editor;

  editor.deleteBackward = (unit) => {
    // eslint-disable-next-line -- TODO: check this
    // @ts-ignore
    if (deleteBackwardList(editor, unit)) return;

    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    // eslint-disable-next-line -- TODO: check this
    // @ts-ignore
    if (deleteForwardList(editor)) return;

    deleteForward(unit);
  };

  editor.deleteFragment = () => {
    // eslint-disable-next-line -- TODO: check this
    // @ts-ignore
    if (deleteFragmentList(editor)) return;

    deleteFragment();
  };

  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  editor.insertBreak = insertListBreak(editor);

  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  editor.insertFragment = insertListFragment(editor);

  // TODO: replace with Normalizer rules
  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  editor.normalizeNode = normalizeList(editor, { validLiChildrenTypes });

  return editor;
};
