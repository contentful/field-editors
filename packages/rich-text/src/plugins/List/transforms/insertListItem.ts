// @ts-nocheck
import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import {
  getAboveNode,
  getParentNode,
  insertNodes,
  isFirstChild,
  isSelectionAtBlockEnd,
  isSelectionAtBlockStart,
  moveChildren,
} from '@udecode/plate-core';
import { Editor, Path, Transforms } from 'slate';

import { withoutNormalizing } from '../../../internal';
import { setSelection } from '../../../internal/transforms';
import { CustomElement, RichTextEditor } from '../../../types';

/**
 * Build a new list item node while preserving marks
 */
const emptyListItemNode = (editor: RichTextEditor, withChildren = false): CustomElement => {
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
export const insertListItem = (editor: RichTextEditor): boolean => {
  if (!editor.selection) {
    return false;
  }

  // Naming it paragraph for simplicity but can be a heading as well
  const paragraph = getAboveNode(editor, { match: { type: TEXT_CONTAINERS } });
  if (!paragraph) {
    return false;
  }

  const [, paragraphPath] = paragraph;
  const listItem = getParentNode(editor, paragraphPath);

  if (!listItem) {
    return false;
  }

  const [listItemNode, listItemPath] = listItem;

  if (listItemNode.type !== BLOCKS.LIST_ITEM) {
    return false;
  }

  // We are in a li>p (or heading)

  withoutNormalizing(editor, () => {
    if (!editor.selection) {
      return;
    }

    // Check the cursor position in the current paragraph
    const isAtStart = isSelectionAtBlockStart(editor);
    const isAtEnd = isSelectionAtBlockEnd(editor);

    const isAtStartOfListItem = isAtStart && isFirstChild(paragraphPath);
    const shouldSplit = !isAtStart && !isAtEnd;

    // Split the current paragraph content if necessary
    if (shouldSplit) {
      Transforms.splitNodes(editor);
    }

    // Insert the new li
    const newListItemPath = isAtStartOfListItem ? listItemPath : Path.next(listItemPath);

    insertNodes(
      editor,
      // Add an empty paragraph to the new li if We will not move some
      // paragraphs over there.
      emptyListItemNode(editor, !shouldSplit),
      { at: newListItemPath }
    );

    // Move children *after* selection to the new li
    const fromPath = isAtStart ? paragraphPath : Path.next(paragraphPath);
    const fromStartIndex = fromPath[fromPath.length - 1] || 0;

    // On split we don't add paragraph to the new li so we move
    // content to the very beginning. Otherwise, account for the empty
    // paragraph at the beginning by moving the content after
    const toPath = newListItemPath.concat([shouldSplit ? 0 : 1]);

    if (!isAtStartOfListItem) {
      moveChildren(editor, {
        at: listItemPath,
        to: toPath,
        fromStartIndex,
      });
    }

    // Move cursor to the start of the new li
    setSelection(editor, newListItemPath);
    Transforms.collapse(editor, { edge: 'start' });
  });

  // Returning True skips processing other editor.insertBreak handlers
  return true;
};
