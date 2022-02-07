import { BLOCKS } from '@contentful/rich-text-types';
import { PlateEditor, getAbove, getParent } from '@udecode/plate-core';
import { NodeEntry, Transforms, Path, Node, Text } from 'slate';

import { CustomElement } from '../../types';

const isList = (node: CustomElement) =>
  [BLOCKS.OL_LIST, BLOCKS.UL_LIST].includes(node.type as BLOCKS);

export const hasListAsDirectParent = (editor: PlateEditor, [, path]: NodeEntry) => {
  const [parentNode] = (getParent(editor, path) || []) as NodeEntry;
  return isList(parentNode as CustomElement);
};

const getNearestListAncestor = (editor: PlateEditor, path: Path) => {
  return getAbove(editor, { at: path, mode: 'lowest', match: isList }) || [];
};

/**
 * Places orphaned list items in a list. If there's a list somewhere
 * in the node's ancestors, defaults to that list type, else places
 * the list item in an unordered list.
 */
export const normalizeOrphanedListItem = (editor: PlateEditor, [, path]: NodeEntry) => {
  const [parentList] = getNearestListAncestor(editor, path);
  const parentListType = parentList?.type;
  Transforms.wrapNodes(
    editor,
    { type: parentListType || BLOCKS.UL_LIST, children: [], data: {} },
    { at: path }
  );
};

export const isNonEmptyListItem = (editor: PlateEditor, [, path]: NodeEntry) => {
  const listItemChildren = Array.from(Node.children(editor, path));

  return listItemChildren.length !== 0;
};

export const firstNodeIsNotList = (_editor: PlateEditor, [node]: NodeEntry<CustomElement>) => {
  const firstNode = node.children?.[0];

  return !!firstNode && !Text.isText(firstNode) && !isList(firstNode);
};

export const insertParagraphAsChild = (editor: PlateEditor, [, path]: NodeEntry) => {
  Transforms.insertNodes(editor, [{ type: BLOCKS.PARAGRAPH, data: {}, children: [{ text: '' }] }], {
    at: path.concat([0]),
  });
};

export const replaceNodeWithListItems = (editor, entry) => {
  const [node, path] = entry;

  Transforms.removeNodes(editor, { at: path });
  Transforms.insertNodes(editor, node.children[0].children, { at: path });
};
