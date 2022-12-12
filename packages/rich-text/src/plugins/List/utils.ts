// @ts-nocheck
import { BLOCKS } from '@contentful/rich-text-types';
import { getAboveNode, getBlockAbove, getParentNode } from '@udecode/plate-core';
import { NodeEntry, Transforms, Path, Node, Text, Range } from 'slate';

import { insertNodes } from '../../internal/transforms';
import { CustomElement, RichTextEditor } from '../../types';

const isList = (node: CustomElement) =>
  [BLOCKS.OL_LIST, BLOCKS.UL_LIST].includes(node.type as BLOCKS);

export const hasListAsDirectParent = (editor: RichTextEditor, [, path]: NodeEntry) => {
  const [parentNode] = (getParentNode(editor, path) || []) as NodeEntry;
  return isList(parentNode as CustomElement);
};

const getNearestListAncestor = (editor: RichTextEditor, path: Path) => {
  return getAboveNode(editor, { at: path, mode: 'lowest', match: isList }) || [];
};

/**
 * Places orphaned list items in a list. If there's a list somewhere
 * in the node's ancestors, defaults to that list type, else places
 * the list item in an unordered list.
 */
export const normalizeOrphanedListItem = (editor: RichTextEditor, [, path]: NodeEntry) => {
  const [parentList] = getNearestListAncestor(editor, path);
  const parentListType = parentList?.type;
  Transforms.wrapNodes(
    editor,
    { type: parentListType || BLOCKS.UL_LIST, children: [], data: {} },
    { at: path }
  );
};

export const isNonEmptyListItem = (editor: RichTextEditor, [, path]: NodeEntry) => {
  const listItemChildren = Array.from(Node.children(editor, path));

  return listItemChildren.length !== 0;
};

export const firstNodeIsNotList = (_editor: RichTextEditor, [node]: NodeEntry<CustomElement>) => {
  if (node.children.length === 1) {
    const firstNode = node.children[0];

    return !Text.isText(firstNode) && !isList(firstNode);
  }

  return true;
};

export const insertParagraphAsChild = (editor: RichTextEditor, [, path]: NodeEntry) => {
  insertNodes(editor, [{ type: BLOCKS.PARAGRAPH, data: {}, children: [{ text: '' }] }], {
    at: path.concat([0]),
  });
};

export const replaceNodeWithListItems = (editor, entry) => {
  const [node, path] = entry;

  Transforms.removeNodes(editor, { at: path });
  insertNodes(editor, node.children[0].children, { at: path });
};

export const isListTypeActive = (editor: RichTextEditor, type: BLOCKS): boolean => {
  const { selection } = editor;

  if (!selection) {
    return false;
  }

  if (Range.isExpanded(selection)) {
    const [start, end] = Range.edges(selection);
    const node = Node.common(editor, start.path, end.path);

    if ((node[0] as CustomElement).type === type) {
      return true;
    }
  }

  // Lists can be nested. Here, we take the list type at the lowest level
  const listNode = getBlockAbove(editor, {
    match: {
      type: [BLOCKS.OL_LIST, BLOCKS.UL_LIST],
    },
    mode: 'lowest',
  });

  return listNode?.[0].type === type;
};
