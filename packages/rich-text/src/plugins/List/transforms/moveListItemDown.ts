/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { getLastChildPath, match, PlateEditor, TElement, wrapNodes } from '@udecode/plate-core';
import { getListTypes } from '@udecode/plate-list';
import { Ancestor, Editor, NodeEntry, Path, Transforms, Node } from 'slate';

export interface MoveListItemDownOptions {
  list: NodeEntry<TElement>;
  listItem: NodeEntry<TElement>;
}

export const moveListItemDown = (
  editor: PlateEditor,
  { list, listItem }: MoveListItemDownOptions
) => {
  const [listNode] = list;
  const [, listItemPath] = listItem;

  let previousListItemPath: Path;

  try {
    previousListItemPath = Path.previous(listItemPath);
  } catch (e) {
    return;
  }

  // Previous sibling is the new parent
  const previousSiblingItem = Editor.node(editor, previousListItemPath) as NodeEntry<Ancestor>;

  if (previousSiblingItem) {
    const [, previousPath] = previousSiblingItem;

    const subList = Array.from(Node.children(editor, previousPath)).find(([n]) =>
      match(n, { type: getListTypes(editor) })
    ) as NodeEntry<Ancestor> | undefined;

    const newPath = Path.next(getLastChildPath(subList ?? previousSiblingItem));

    Editor.withoutNormalizing(editor, () => {
      if (!subList) {
        // Create new sub-list
        wrapNodes(editor, { type: listNode.type, children: [], data: {} }, { at: listItemPath });
      }

      // Move the current item to the sub-list
      Transforms.moveNodes(editor, {
        at: listItemPath,
        to: newPath,
      });
    });
  }
};
