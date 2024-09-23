import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';

import { withoutNormalizing } from '../../../internal';
import {
  getAboveNode,
  getParentNode,
  isFirstChildPath,
  isSelectionAtBlockEnd,
  isSelectionAtBlockStart,
  getMarks,
  getNextPath,
} from '../../../internal/queries';
import {
  select,
  insertNodes,
  moveChildren,
  splitNodes,
  collapseSelection,
} from '../../../internal/transforms';
import { Element, PlateEditor } from '../../../internal/types';

/**
 * Build a new list item node while preserving marks
 */
const emptyListItemNode = (editor: PlateEditor, withChildren = false): Element => {
  let children: Element[] = [];

  if (withChildren) {
    const marks = getMarks(editor) || {};

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

    const isAtStartOfListItem = isAtStart && isFirstChildPath(paragraphPath);
    const shouldSplit = !isAtStart && !isAtEnd;

    // Split the current paragraph content if necessary
    if (shouldSplit) {
      splitNodes(editor);
    }

    // Insert the new li
    const newListItemPath = isAtStartOfListItem ? listItemPath : getNextPath(listItemPath);

    insertNodes(
      editor,
      // Add an empty paragraph to the new li if We will not move some
      // paragraphs over there.
      emptyListItemNode(editor, !shouldSplit),
      { at: newListItemPath }
    );

    // Move children *after* selection to the new li
    const fromPath = isAtStart ? paragraphPath : getNextPath(paragraphPath);
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
    select(editor, newListItemPath);
    collapseSelection(editor, { edge: 'start' });
  });

  // Returning True skips processing other editor.insertBreak handlers
  return true;
};
