/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { getListTypes } from '@udecode/plate-list';

import { withoutNormalizing } from '../../../internal';
import {
  getNodeEntry,
  getNodeChildren,
  getNextPath,
  getPreviousPath,
  getLastChildPath,
  match,
} from '../../../internal/queries';
import { wrapNodes, moveNodes } from '../../../internal/transforms';
import { NodeEntry, PlateEditor, Element, Path } from '../../../internal/types';

export interface MoveListItemDownOptions {
  list: NodeEntry;
  listItem: NodeEntry;
}

export const moveListItemDown = (
  editor: PlateEditor,
  { list, listItem }: MoveListItemDownOptions
) => {
  const [listNode] = list;
  const [, listItemPath] = listItem;

  let previousListItemPath: Path;

  try {
    previousListItemPath = getPreviousPath(listItemPath);
  } catch (e) {
    return;
  }

  // Previous sibling is the new parent
  const previousSiblingItem = getNodeEntry(editor, previousListItemPath) as NodeEntry;

  if (previousSiblingItem) {
    const [, previousPath] = previousSiblingItem;

    const subList = Array.from(getNodeChildren(editor, previousPath)).find(([n, path]) =>
      match(n, path, { type: getListTypes(editor) })
    ) as NodeEntry | undefined;

    const newPath = getNextPath(getLastChildPath(subList ?? previousSiblingItem));

    withoutNormalizing(editor, () => {
      if (!subList) {
        // Create new sub-list
        wrapNodes(editor, { type: listNode.type, children: [], data: {} } as Element, {
          at: listItemPath,
        });
      }

      // Move the current item to the sub-list
      moveNodes(editor, {
        at: listItemPath,
        to: newPath,
      });
    });
  }
};
