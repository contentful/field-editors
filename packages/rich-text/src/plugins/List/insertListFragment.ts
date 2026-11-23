/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { TEXT_CONTAINERS, BLOCKS } from '@contentful/rich-text-types';
import { Range } from 'slate';

import { findNode } from '../../internal/plate';
import {
  isBlockNode,
  isAncestorPath,
  getCommonNode,
  getNodeTexts,
  getParentPath,
  getDescendantNodeByPath,
} from '../../internal/queries';
import { insertNodes, removeNodes } from '../../internal/transforms';
import { PlateEditor, NodeEntry, Node, Element } from '../../internal/types';

const getFirstAncestorOfType = (root: Node, entry: NodeEntry): NodeEntry => {
  let ancestor = getParentPath(entry[1]);
  while (getDescendantNodeByPath(root, ancestor).type !== BLOCKS.LIST_ITEM) {
    ancestor = getParentPath(ancestor);
  }

  return [getDescendantNodeByPath(root, ancestor), ancestor];
};

const isListRoot = (node: Node): boolean =>
  [BLOCKS.UL_LIST, BLOCKS.OL_LIST].includes((node as Element).type as BLOCKS);

/**
 * Removes the "empty" leading lis. Empty in this context means lis only with other lis as children.
 *
 * @returns If argument is not a list root, returns it, otherwise returns ul[] or li[].
 */
const trimList = (listRoot: Node): Node[] => {
  if (!isListRoot(listRoot)) {
    return [listRoot];
  }

  const textEntries = Array.from(getNodeTexts(listRoot));

  const commonAncestorEntry = textEntries.reduce<NodeEntry>(
    (commonAncestor, textEntry) =>
      isAncestorPath(commonAncestor[1], textEntry[1])
        ? commonAncestor
        : getCommonNode(listRoot, textEntry[1], commonAncestor[1]),
    // any list item would do, we grab the first one
    getFirstAncestorOfType(listRoot, textEntries[0]),
  );

  return isListRoot(commonAncestorEntry[0])
    ? (commonAncestorEntry[0].children as Node[])
    : [commonAncestorEntry[0]];
};

/**
 * `trimList` returns the list root's items, which drops the root's list type.
 * When the trimmed nodes are exactly that root's items, put them back under a
 * root of the same type so an ordered list is not pasted as an unordered one.
 */
const keepListRootType = (root: Node, trimmed: Node[]): Node[] => {
  const rootChildren = (root as Element).children as Node[] | undefined;
  const isRootItems =
    isListRoot(root) &&
    !!rootChildren &&
    trimmed.length === rootChildren.length &&
    trimmed.every((node, index) => node === rootChildren[index]);

  return isRootItems ? [{ ...root, children: trimmed }] : trimmed;
};

/**
 * Removes leading li when pasting a single li with a single child.
 */
const trimLiWrapper = (nodes: Node[]): Node[] => {
  if (nodes.length !== 1) {
    return nodes;
  }

  const node = nodes[0];

  if (node.type !== BLOCKS.LIST_ITEM || (node as Element).children.length !== 1) {
    return nodes;
  }

  return node.children as Node[];
};

const unwrapTextContainerAtStart = (nodes: Node[]): Node[] => {
  const node = nodes[0];

  if (TEXT_CONTAINERS.includes((node as Element).type as BLOCKS)) {
    return [...(node as Element).children, ...nodes.slice(1)];
  }

  return nodes;
};

/**
 * Replaces top-level blocks that the selection covers completely with a pasted list.
 * The list lands at top level, so its type is kept and no empty wrapper item remains.
 *
 * @returns true when the replacement was applied.
 */
const replaceWholeBlocksWithList = (editor: PlateEditor, fragment: Node[]): boolean => {
  const selection = editor.selection;
  if (!selection || Range.isCollapsed(selection) || fragment.length !== 1) {
    return false;
  }
  if (!isListRoot(fragment[0])) {
    return false;
  }

  const [from, to] = Range.edges(selection);
  const startIndex = from.path[0];
  const endIndex = to.path[0];
  const coversWholeBlocks =
    editor.api.isStart(from, [startIndex]) && editor.api.isEnd(to, [endIndex]);
  if (!coversWholeBlocks) {
    return false;
  }

  // Insert after the selected blocks first, then remove them, so the document never empties.
  insertNodes(editor, fragment, { at: [endIndex + 1] });
  for (let index = endIndex; index >= startIndex; index--) {
    removeNodes(editor, { at: [index] });
  }
  editor.tf.select(editor.api.end([startIndex]));
  return true;
};

export const insertListFragment = (editor: PlateEditor) => {
  const { insertFragment } = editor;

  return (fragment: Node[], options?: Parameters<PlateEditor['insertFragment']>[1]) => {
    if (!editor.selection) {
      return;
    }

    if (replaceWholeBlocksWithList(editor, fragment)) {
      return;
    }

    const liEntry = findNode(editor, {
      match: { type: BLOCKS.LIST_ITEM },
      mode: 'lowest',
    });

    if (liEntry) {
      // A collapsed cursor keeps the surrounding list's type; only replacing a selection keeps the pasted type.
      const isReplacingSelection = !editor.api.isCollapsed();
      const nodes = unwrapTextContainerAtStart(
        trimLiWrapper(
          fragment.flatMap((node) => {
            const trimmed = trimList(node);
            return isReplacingSelection ? keepListRootType(node, trimmed) : trimmed;
          }),
        ),
      );

      let firstBlockIndex = nodes.findIndex((node) => isBlockNode(editor, node));

      if (firstBlockIndex < 0) {
        firstBlockIndex = nodes.length;
      }

      const inlines = nodes.slice(0, firstBlockIndex);
      const blocks = nodes.slice(firstBlockIndex);

      // Two calls to insertNodes are required here. Otherwise, all blocks
      // after a text or inline element occurrence will be unwrapped for
      // some reason.
      insertNodes(editor, inlines, {
        at: editor.selection,
        select: true,
      });

      return insertNodes(editor, blocks, {
        at: editor.selection,
        select: true,
      });
    }

    const filtered = isListRoot(fragment[0]) ? [{ text: '' }, ...fragment] : fragment;

    return insertFragment(filtered, options);
  };
};
