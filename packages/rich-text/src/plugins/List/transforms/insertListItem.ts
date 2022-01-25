import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import {
  getAbove,
  getParent,
  insertNodes,
  isFirstChild,
  isLastChild,
  isSelectionAtBlockEnd,
  isSelectionAtBlockStart,
  moveChildren,
  PlateEditor,
} from '@udecode/plate-core';
import { Editor, Path, Transforms } from 'slate';

import { CustomElement } from '../../../types';

/**
 * Build a new list item node while preserving marks
 */
const emptyListItemNode = (editor: PlateEditor, withChildren = false): CustomElement => {
  let children: CustomElement[] = [];

  if (withChildren) {
    const marks = Editor.marks(editor) || {};

    children = [
      {
        type: BLOCKS.PARAGRAPH,
        data: {},
        children: [{ text: '', ...marks }],
      },
    ];
  }

  return {
    type: BLOCKS.LIST_ITEM,
    data: {},
    children,
  };
};

/**
 * Insert list item if selection is in li>p.
 */
export const insertListItem = (editor: PlateEditor): boolean => {
  if (!editor.selection) {
    return false;
  }

  // Naming it paragraph for simplicity but can be a heading as well
  const paragraph = getAbove(editor, { match: { type: TEXT_CONTAINERS } });
  if (!paragraph) {
    return false;
  }

  const [, paragraphPath] = paragraph;
  const listItem = getParent(editor, paragraphPath);

  if (!listItem) {
    return false;
  }

  const [listItemNode, listItemPath] = listItem;

  if (listItemNode.type !== BLOCKS.LIST_ITEM) {
    return false;
  }

  // We are in a li>p (or heading)

  Editor.withoutNormalizing(editor, () => {
    if (!editor.selection) {
      return;
    }

    // Check the cursor position in the current paragraph
    const isAtStart = isSelectionAtBlockStart(editor);
    const isAtEnd = isSelectionAtBlockEnd(editor);

    const isAtStartOfListItem = isAtStart && isFirstChild(paragraphPath);
    const isAtEndOfListItem = isAtEnd && isLastChild(listItem, paragraphPath);

    // Split the current paragraph content if necessary
    if (!isAtStart && !isAtEnd) {
      Transforms.splitNodes(editor);
    }

    // Insert the new li
    const newListItemPath = isAtStartOfListItem ? listItemPath : Path.next(listItemPath);

    insertNodes(
      editor,
      // Add an empty paragraph to the new li if We will not move some
      // paragraphs over there.
      emptyListItemNode(editor, isAtStartOfListItem || isAtEndOfListItem),
      { at: newListItemPath }
    );

    // Move children *after* selection to the new li
    const fromPath = isAtStart ? paragraphPath : Path.next(paragraphPath);
    const fromStartIndex = fromPath[fromPath.length - 1] || 0;

    moveChildren(editor, {
      at: listItemPath,
      to: newListItemPath.concat([0]),
      fromStartIndex,
    });

    // Move cursor to the start of the new li
    Transforms.select(editor, newListItemPath);
    Transforms.collapse(editor, { edge: 'start' });
  });

  // Returning True skips processing other editor.insertBreak handlers
  return true;
};
