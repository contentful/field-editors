/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { BLOCKS } from '@contentful/rich-text-types';
import {
  getListItemEntry,
  removeFirstListItem,
  removeListItem,
  isListNested,
} from '@udecode/plate-list';
import { onKeyDownResetNode, SIMULATE_BACKSPACE } from '@udecode/plate-reset-node';

import { withoutNormalizing } from '../../../internal';
import { mockPlugin } from '../../../internal/misc';
import { isSelectionAtBlockStart, isFirstChild } from '../../../internal/queries';
import { deleteFragment } from '../../../internal/transforms';
import { PlateEditor } from '../../../internal/types';
import { unwrapList } from './unwrapList';

export const deleteBackwardList = (
  editor: PlateEditor,
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
            // TODO look into this
            // @ts-expect-error
            mockPlugin({
              options: {
                rules: [
                  {
                    types: [BLOCKS.LIST_ITEM],
                    defaultType: BLOCKS.PARAGRAPH,
                    hotkey: 'backspace',
                    predicate: () => isSelectionAtBlockStart(editor),
                    onReset: (e: PlateEditor) => unwrapList(e),
                  },
                ],
              },
            })
          )(SIMULATE_BACKSPACE);
          moved = true;
          return;
        }

        deleteFragment(editor, {
          // FIXME: see if we can remove unit
          // @ts-expect-error
          unit: unit,
          reverse: true,
        });
        moved = true;
      });
    }
  }

  return moved;
};
