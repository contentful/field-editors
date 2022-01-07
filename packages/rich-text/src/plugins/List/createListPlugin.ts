import { BLOCKS, LIST_ITEM_BLOCKS } from '@contentful/rich-text-types';
import { HotkeyPlugin, KeyboardHandler } from '@udecode/plate-core';
import {
  createListPlugin as createPlateListPlugin,
  ELEMENT_LI,
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_LIC,
} from '@udecode/plate-list';
import { Node, Path, Transforms } from 'slate';

import { getNodeEntryFromSelection } from '../../helpers/editor';
import { transformParagraphs, transformWrapIn } from '../../helpers/transformers';
import { RichTextPlugin } from '../../types';
import { ListOL, ListUL } from './components/List';
import { ListItem } from './components/ListItem';
import {
  isNonEmptyListItem,
  hasListAsDirectParent,
  insertParagraphAsChild,
  normalizeOrphanedListItem,
} from './utils';
import { withList } from './withList';

const onKeyDown: KeyboardHandler<{}, HotkeyPlugin> =
  (editor) =>
  (event: React.KeyboardEvent): void => {
    if (!editor.selection) return;
    const [, pathToListItem] = getNodeEntryFromSelection(editor, BLOCKS.LIST_ITEM, {
      reverse: true,
    });

    if (pathToListItem) {
      const isEvent = event.key === 'Enter';

      if (isEvent) {
        const children = Array.from(Node.children(editor, pathToListItem));
        const pivot = editor.selection.focus.path[pathToListItem.length];
        const siblingsBelowCurrentListItem = children.slice(pivot + 1);
        const lastListItemIndex = pathToListItem.length - 1;
        const nodePathsToRemove: Path[] = [];
        for (let i = 0; i < siblingsBelowCurrentListItem.length; i++) {
          const [node, path] = siblingsBelowCurrentListItem[i];
          nodePathsToRemove.unshift(path);
          const nextListItemIndex = pathToListItem[lastListItemIndex] + i + 1;
          const nextListItemPath = pathToListItem
            .slice(0, lastListItemIndex)
            .concat(nextListItemIndex);
          Transforms.insertNodes(
            editor,
            { type: BLOCKS.LIST_ITEM, data: {}, children: [node] },
            { at: nextListItemPath }
          );
        }
        for (const path of nodePathsToRemove) {
          Transforms.removeNodes(editor, { at: path });
        }
      }
    }
  };

export const createListPlugin = (): RichTextPlugin =>
  createPlateListPlugin({
    normalizer: [
      {
        match: {
          type: [BLOCKS.UL_LIST, BLOCKS.OL_LIST],
        },
        validChildren: [BLOCKS.LIST_ITEM],
        transform: transformWrapIn(BLOCKS.LIST_ITEM),
      },
    ],
    handlers: { onKeyDown },
    overrideByKey: {
      [ELEMENT_UL]: {
        type: BLOCKS.UL_LIST,
        component: ListUL,
        // The withList is added on ELEMENT_UL plugin in upstream code
        // so we need to override it here
        withOverrides: withList,
      },
      [ELEMENT_OL]: {
        type: BLOCKS.OL_LIST,
        component: ListOL,
      },
      // ELEMENT_LIC is a child of li, Slate does ul > li > lic + ul
      [ELEMENT_LIC]: {
        type: BLOCKS.PARAGRAPH,
      },
      [ELEMENT_LI]: {
        type: BLOCKS.LIST_ITEM,
        component: ListItem,
        normalizer: [
          {
            validNode: hasListAsDirectParent,
            transform: normalizeOrphanedListItem,
          },
          {
            validNode: isNonEmptyListItem,
            transform: insertParagraphAsChild,
          },
          {
            validChildren: LIST_ITEM_BLOCKS,
            transform: transformParagraphs,
          },
        ],
      },
    },
  } as Partial<RichTextPlugin>);
