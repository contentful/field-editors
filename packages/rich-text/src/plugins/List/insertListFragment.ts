/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { TEXT_CONTAINERS, BLOCKS } from '@contentful/rich-text-types';
import { findNode, TDescendant } from '@udecode/plate-core';
import { Editor, Node, NodeEntry, Path, Transforms } from 'slate';

import { RichTextEditor } from '../../types';

// eslint-disable-next-line -- TODO: check this
// @ts-ignore
const getFirstAncestorOfType = (root: TDescendant, entry: NodeEntry): NodeEntry<TDescendant> => {
  let ancestor: Path = Path.parent(entry[1]);
  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  while ((Node.get(root, ancestor) as TDescendant).type !== BLOCKS.LIST_ITEM) {
    ancestor = Path.parent(ancestor);
  }

  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  return [Node.get(root, ancestor), ancestor];
};

const isListRoot = (node: TDescendant): boolean =>
  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  [BLOCKS.UL_LIST, BLOCKS.OL_LIST].includes(node.type);

/**
 * Removes the "empty" leading lis. Empty in this context means lis only with other lis as children.
 *
 * @returns If argument is not a list root, returns it, otherwise returns ul[] or li[].
 */
const trimList = <T extends TDescendant>(listRoot: T): T[] => {
  if (!isListRoot(listRoot)) {
    return [listRoot];
  }

  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  const textEntries = Array.from(Node.texts(listRoot));

  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  const commonAncestorEntry = textEntries.reduce<NodeEntry<TDescendant>>(
    (commonAncestor, textEntry) =>
      // eslint-disable-next-line -- TODO: check this
      // @ts-ignore
      Path.isAncestor(commonAncestor[1], textEntry[1])
        ? commonAncestor
        : // eslint-disable-next-line -- TODO: check this
          // @ts-ignore
          Node.common(listRoot, textEntry[1], commonAncestor[1]),
    // any list item would do, we grab the first one
    getFirstAncestorOfType(listRoot, textEntries[0])
  );

  return isListRoot(commonAncestorEntry[0])
    ? // eslint-disable-next-line -- TODO: check this
      // @ts-ignore
      commonAncestorEntry[0].children
    : [commonAncestorEntry[0]];
};

/**
 * Removes leading li when pasting a single li with a single child.
 */
const trimLiWrapper = <T extends TDescendant>(nodes: T[]): T[] => {
  if (nodes.length !== 1) {
    return nodes;
  }

  const node = nodes[0];

  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  if (node.type !== BLOCKS.LIST_ITEM || node.children.length !== 1) {
    return nodes;
  }

  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  return node.children;
};

const unwrapTextContainerAtStart = <T extends TDescendant>(nodes: T[]): T[] => {
  const node = nodes[0];

  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  if (TEXT_CONTAINERS.includes(node.type)) {
    // eslint-disable-next-line -- TODO: check this
    // @ts-ignore
    return [...node.children, ...nodes.slice(1)];
  }

  return nodes;
};

export const insertListFragment = (editor: RichTextEditor) => {
  const { insertFragment } = editor;

  return (fragment: TDescendant[]) => {
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

      // eslint-disable-next-line -- TODO: check this
      // @ts-ignore
      let firstBlockIndex = nodes.findIndex((node) => Editor.isBlock(editor, node));

      if (firstBlockIndex < 0) {
        firstBlockIndex = nodes.length;
      }

      const inlines = nodes.slice(0, firstBlockIndex);
      const blocks = nodes.slice(firstBlockIndex);

      // Two calls to insertNodes are required here. Otherwise, all blocks
      // after a text or inline element occurrence will be unwrapped for
      // some reason.
      // eslint-disable-next-line -- TODO: check this
      // @ts-ignoreá
      Transforms.insertNodes(editor, inlines, {
        at: editor.selection,
        select: true,
      });

      // eslint-disable-next-line -- TODO: check this
      // @ts-ignore
      return Transforms.insertNodes(editor, blocks, {
        at: editor.selection,
        select: true,
      });
    }

    const filtered: TDescendant[] = isListRoot(fragment[0])
      ? [{ text: '' }, ...fragment]
      : fragment;

    return insertFragment(filtered);
  };
};
