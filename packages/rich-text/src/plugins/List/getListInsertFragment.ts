/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { findNode, getPlugin, PlateEditor, TDescendant } from '@udecode/plate-core';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '@udecode/plate-list';
import { Node, NodeEntry, Path, Transforms } from 'slate';

import { RichTextPlugin } from '../../types';

export const getListInsertFragment = (editor: PlateEditor) => {
  const { insertFragment } = editor;

  const li = getPlugin(editor, ELEMENT_LI);
  const ul = getPlugin(editor, ELEMENT_UL);
  const ol = getPlugin(editor, ELEMENT_OL);

  const isListRoot = (node: TDescendant): boolean => [ul.type, ol.type].includes(node.type);

  const getFirstAncestorOfType = (
    root: TDescendant,
    entry: NodeEntry,
    { type }: RichTextPlugin
  ): NodeEntry<TDescendant> => {
    let ancestor: Path = Path.parent(entry[1]);
    while ((Node.get(root, ancestor) as TDescendant).type !== type) {
      ancestor = Path.parent(ancestor);
    }

    return [Node.get(root, ancestor), ancestor];
  };

  /**
   * Removes the "empty" leading lis. Empty in this context means lis only with other lis as children.
   *
   * @returns If argument is not a list root, returns it, otherwise returns ul[] or li[].
   */
  const trimList = <T extends TDescendant>(listRoot: T): T[] => {
    if (!isListRoot(listRoot)) {
      return [listRoot];
    }

    const textEntries = Array.from(Node.texts(listRoot));

    const commonAncestorEntry = textEntries.reduce<NodeEntry<TDescendant>>(
      (commonAncestor, textEntry) =>
        Path.isAncestor(commonAncestor[1], textEntry[1])
          ? commonAncestor
          : Node.common(listRoot, textEntry[1], commonAncestor[1]),
      // any list item would do, we grab the first one
      getFirstAncestorOfType(listRoot, textEntries[0], li)
    );

    return isListRoot(commonAncestorEntry[0])
      ? commonAncestorEntry[0].children
      : [commonAncestorEntry[0]];
  };

  return (fragment: TDescendant[]) => {
    const liEntry = findNode(editor, {
      match: { type: li.type },
      mode: 'lowest',
    });

    if (liEntry) {
      const [, liPath] = liEntry;

      const nodes = fragment.flatMap((node) => trimList(node));

      return Transforms.insertNodes(editor, nodes, {
        at: editor.selection || Path.next(liPath),
        select: true,
      });
    }

    const filtered: TDescendant[] = isListRoot(fragment[0])
      ? [{ text: '' }, ...fragment]
      : fragment;

    return insertFragment(filtered);
  };
};
