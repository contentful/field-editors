/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { BLOCKS, LIST_ITEM_BLOCKS } from '@contentful/rich-text-types';

import { normalizeList, deleteFragmentList, deleteForwardList } from '../../internal/list';
import { getAboveNode, isText } from '../../internal/queries';
import { WithOverride } from '../../internal/types';
import type { Element } from '../../internal/types/editor';
import { insertListBreak } from './insertListBreak';
import { insertListFragment } from './insertListFragment';

const validLiChildrenTypes = LIST_ITEM_BLOCKS;

const isEmptyList = (node: Element) =>
  (node.type === BLOCKS.UL_LIST || node.type === BLOCKS.OL_LIST) &&
  node.children.length > 0 &&
  node.children.every(
    (item) =>
      !isText(item) &&
      item.type === BLOCKS.LIST_ITEM &&
      item.children.length > 0 &&
      item.children.every(
        (block) =>
          !isText(block) &&
          block.type === BLOCKS.PARAGRAPH &&
          block.children.length > 0 &&
          block.children.every((child) => isText(child) && child.text.length === 0),
      ),
  );

export const withList: WithOverride = (editor) => {
  const { deleteBackward, deleteForward, deleteFragment } = editor;

  editor.deleteBackward = (unit) => {
    const listEntry = getAboveNode(editor, {
      match: { type: [BLOCKS.UL_LIST, BLOCKS.OL_LIST] },
    });
    if (
      editor.selection &&
      editor.api.isCollapsed() &&
      listEntry &&
      listEntry[1].length === 1 &&
      isEmptyList(listEntry[0] as Element) &&
      editor.api.isStart(editor.selection.anchor, listEntry[1])
    ) {
      editor.tf.removeNodes({ at: listEntry[1] });
      const nextBlockIndex = Math.min(listEntry[1][0], editor.children.length - 1);
      const nextBlockStart = editor.api.start([nextBlockIndex]);
      if (nextBlockStart) editor.tf.select(nextBlockStart);
      return;
    }

    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    if (deleteForwardList(editor, deleteForward, unit)) return;

    deleteForward(unit);
  };

  editor.deleteFragment = (options) => {
    if (deleteFragmentList(editor)) return;

    deleteFragment(options);
  };

  editor.insertBreak = insertListBreak(editor);

  editor.insertFragment = insertListFragment(editor);

  // TODO: replace with our own Normalizer rules
  editor.normalizeNode = normalizeList(editor, { validLiChildrenTypes });

  return editor;
};
