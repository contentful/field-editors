/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { getLastChildPath, match, PlateEditor, TElement, wrapNodes } from '@udecode/plate-core';
import { getListTypes } from '@udecode/plate-list';
import { Ancestor, Editor, NodeEntry, Path, Transforms, Node } from 'slate';

export interface MoveListItemDownOptions {
  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  list: NodeEntry<TElement>;
  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
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
  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  const previousSiblingItem = Editor.node(editor, previousListItemPath) as NodeEntry<Ancestor>;

  if (previousSiblingItem) {
    const [, previousPath] = previousSiblingItem;

    // eslint-disable-next-line -- TODO: check this
    // @ts-ignore
    const subList = Array.from(Node.children(editor, previousPath)).find(([n]) =>
      // eslint-disable-next-line -- TODO: check this
      // @ts-ignore
      match(n, { type: getListTypes(editor) })
    ) as NodeEntry<Ancestor> | undefined;

    // eslint-disable-next-line -- TODO: check this
    // @ts-ignore
    const newPath = Path.next(getLastChildPath(subList ?? previousSiblingItem));

    // eslint-disable-next-line -- TODO: check this
    // @ts-ignore
    Editor.withoutNormalizing(editor, () => {
      if (!subList) {
        // Create new sub-list
        wrapNodes(editor, { type: listNode.type, children: [], data: {} }, { at: listItemPath });
      }

      // Move the current item to the sub-list
      // eslint-disable-next-line -- TODO: check this
      // @ts-ignore
      Transforms.moveNodes(editor, {
        at: listItemPath,
        to: newPath,
      });
    });
  }
};
