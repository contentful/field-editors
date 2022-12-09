/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
// @ts-nocheck
import { TEXT_CONTAINERS, BLOCKS } from '@contentful/rich-text-types';
import { findNode } from '@udecode/plate-core';
import { insertNodes } from 'internal/transforms';
import { Editor, Node, NodeEntry, Path } from 'slate';

import { RichTextEditor } from '../../types';

const getFirstAncestorOfType = (root: any, entry: NodeEntry): NodeEntry<any> => {
  let ancestor: Path = Path.parent(entry[1]);
  while ((Node.get(root, ancestor) as any).type !== BLOCKS.LIST_ITEM) {
    ancestor = Path.parent(ancestor);
  }

  return [Node.get(root, ancestor), ancestor];
};

const isListRoot = (node: any): boolean => [BLOCKS.UL_LIST, BLOCKS.OL_LIST].includes(node.type);

/**
 * Removes the "empty" leading lis. Empty in this context means lis only with other lis as children.
 *
 * @returns If argument is not a list root, returns it, otherwise returns ul[] or li[].
 */
const trimList = <T extends any>(listRoot: T): T[] => {
  if (!isListRoot(listRoot)) {
    return [listRoot];
  }

  const textEntries = Array.from(Node.texts(listRoot));

  const commonAncestorEntry = textEntries.reduce<NodeEntry<any>>(
    (commonAncestor, textEntry) =>
      Path.isAncestor(commonAncestor[1], textEntry[1])
        ? commonAncestor
        : Node.common(listRoot, textEntry[1], commonAncestor[1]),
    // any list item would do, we grab the first one
    getFirstAncestorOfType(listRoot, textEntries[0])
  );

  return isListRoot(commonAncestorEntry[0])
    ? commonAncestorEntry[0].children
    : [commonAncestorEntry[0]];
};

/**
 * Removes leading li when pasting a single li with a single child.
 */
const trimLiWrapper = <T extends any>(nodes: T[]): T[] => {
  if (nodes.length !== 1) {
    return nodes;
  }

  const node = nodes[0];

  if (node.type !== BLOCKS.LIST_ITEM || node.children.length !== 1) {
    return nodes;
  }

  return node.children;
};

const unwrapTextContainerAtStart = <T extends any>(nodes: T[]): T[] => {
  const node = nodes[0];

  if (TEXT_CONTAINERS.includes(node.type)) {
    return [...node.children, ...nodes.slice(1)];
  }

  return nodes;
};

export const insertListFragment = (editor: RichTextEditor) => {
  const { insertFragment } = editor;

  return (fragment: any[]) => {
    if (!editor.selection) {
      return;
    }

    const liEntry = findNode(editor, {
      match: { type: BLOCKS.LIST_ITEM },
      mode: 'lowest',
    });

    if (liEntry) {
      const nodes = unwrapTextContainerAtStart(
        trimLiWrapper(fragment.flatMap((node) => trimList(node)))
      );

      let firstBlockIndex = nodes.findIndex((node) => Editor.isBlock(editor, node));

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

    const filtered: any[] = isListRoot(fragment[0]) ? [{ text: '' }, ...fragment] : fragment;

    return insertFragment(filtered);
  };
};
