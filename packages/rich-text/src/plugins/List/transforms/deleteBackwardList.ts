/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
// @ts-nocheck
import { BLOCKS } from '@contentful/rich-text-types';
import {
  deleteFragment,
  isFirstChild,
  isSelectionAtBlockStart,
  mockPlugin,
} from '@udecode/plate-core';
import {
  getListItemEntry,
  removeFirstListItem,
  removeListItem,
  isListNested,
} from '@udecode/plate-list';
import { onKeyDownResetNode, ResetNodePlugin, SIMULATE_BACKSPACE } from '@udecode/plate-reset-node';
import { withoutNormalizing } from 'internal';

import { RichTextEditor } from '../../../types';
import { unwrapList } from './unwrapList';

export const deleteBackwardList = (
  editor: RichTextEditor,
  unit: 'character' | 'word' | 'line' | 'block'
) => {
  const res = getListItemEntry(editor, {});

  let moved: boolean | undefined = false;

  if (res) {
    const { list, listItem } = res;

    if (
      isSelectionAtBlockStart(editor, {
        match: (node) => node.type === BLOCKS.LIST_ITEM,
      })
    ) {
      withoutNormalizing(editor, () => {
        moved = removeFirstListItem(editor, { list, listItem });
        if (moved) return;

        moved = removeListItem(editor, { list, listItem });
        if (moved) return;

        if (isFirstChild(listItem[1]) && !isListNested(editor, list[1])) {
          onKeyDownResetNode(
            editor,
            mockPlugin<ResetNodePlugin>({
              options: {
                rules: [
                  {
                    types: [BLOCKS.LIST_ITEM],
                    defaultType: BLOCKS.PARAGRAPH,
                    hotkey: 'backspace',
                    predicate: () => isSelectionAtBlockStart(editor),
                    onReset: (e) => unwrapList(e),
                  },
                ],
              },
            })
          )(SIMULATE_BACKSPACE);
          moved = true;
          return;
        }

        deleteFragment(editor, {
          unit,
          reverse: true,
        });
        moved = true;
      });
    }
  }

  return moved;
};
